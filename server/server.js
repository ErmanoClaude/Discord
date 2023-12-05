const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const JWT = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const server = http.createServer(app);

// Routes
const authRoutes = require("./routes/auth");
const serverChannelRoutes = require("./routes/ServersChannel");
const friendsRoutes = require("./routes/friends");
const chatsRoutes = require("./routes/chats");

// json() to parse body
app.use(express.json());

// dotenv config for .env
require("dotenv").config();

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true, // Allows cookie to be enabled
	}),
);

// Parse cookies when returned
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Set cache-control headers to no-store middleware
// so cant go back to request that is being sent to front end
app.use((req, res, next) => {
	res.set("Cache-Control", "no-store");
	next();
});

app.use(
	session({
		key: "userId",
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			expires: 60 * 60 * 24 * 10, // 10 days of saving cooke
		},
	}),
);

// connect to DB
const db = require("./config/databaseConfig");

// DB queries
const {
	getFriendshipId,
	insertMessage,
	getDisplayName,
	checkServerMember,
	insertGroupMessage,
} = require("./services/socketQueries");

// check route
app.get("/api/hello", (req, res) => {
	res.send({ hello: "hi" });
});

// Routes
app.use("/api", authRoutes);
app.use("/api", serverChannelRoutes);
app.use("/api", friendsRoutes);
app.use("/api/message", chatsRoutes);

// Connect user to webSocket socket.io
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Authenticate middleware for socket.
io.use((socket, next) => {
	const token = socket.handshake.auth.token;

	// If no token is provided, reject the connection
	if (!token) {
		return next(new Error("Authentication Error: No token provided"));
	}

	JWT.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
		if (err) {
			// Handle JWT verification error
			console.error("JWT Verification Error:", err);

			// Reject the connection if JWT verification fails
			return next(new Error("Authentication Error: Invalid token"));
		}

		// Stores userId of person connected
		socket.userId = decoded.userId;
		// Stores displayname of person connected
		socket.displayname = await getDisplayName(decoded.userId);
		next();
	});
});

// Keep track of current memembers of voiceRooms
// serverVoiceRooms = `{${serverId}`:{'voiceRoom-15-2':SET('Nono','AnotherNono')}}
const serverVoiceRooms = {};
const serverVoiceRoomsIds = {};

io.on("connection", async (socket) => {
	console.log(`${socket.userId} is connected to the server`);
	let chatRoom = null;
	let voiceRoom = null;
	let serverRoom = null;

	// keep track of the server which voice channel your in.
	let currentVoiceServer = null;

	// Emit the database id to keep peers synced
	socket.emit("init", { id: socket.userId, displayname: socket.displayname });

	// Emit event asking client for context
	socket.emit("where are you?");

	// change availability to online
	const availability = `UPDATE users SET status = 'online' WHERE id=${socket.userId}`;
	db.query(availability);

	// disconnect
	socket.on("disconnect", async () => {
		// Set user online status to offline
		const availabilityDisconnect = `UPDATE users SET status = 'offline' WHERE id=${socket.userId}`;
		console.log(`${socket.userId} is disconnected to the server`);
		db.query(availabilityDisconnect);

		// Remove the user from the current voice room set
		if (currentVoiceServer) {
			// Remove the user from the current voice room set
			serverVoiceRooms[currentVoiceServer][voiceRoom].delete(
				socket.displayname,
			);
			serverVoiceRoomsIds[currentVoiceServer][voiceRoom].delete(
				socket.userId,
			);

			// make copy of room change sets to arrays to send
			let members = {};
			for (let room in serverVoiceRooms[currentVoiceServer]) {
				const channelIdMatch = room.match(/voiceroom-(\d+)-(\d+)/);
				const [, , channelId] = channelIdMatch;
				members[channelId] = [
					...serverVoiceRooms[currentVoiceServer][room],
				];
			}

			// Send current members of every voice channel of that server
			if (serverVoiceRooms[currentVoiceServer]) {
				io.to(`server-${currentVoiceServer}`).emit("joined voice room", {
					members,
				});
			}
		}

		// leave room
		if (voiceRoom) {
			socket
				.to(voiceRoom)
				.emit("left group voice chat", String(socket.userId));
			socket.leave(voiceRoom);
		}
		// Remove the user from all rooms
		const rooms = Object.keys(socket.rooms);
		rooms.forEach((room) => {
			socket.leave(room);
		});
	});

	// Reconnect
	socket.on("reconnect", async () => {
		// Emit event asking client for context
		socket.emit("where are you?");
		const availabilityReconnect = `UPDATE users SET status = 'online' WHERE id=${socket.userId}`;
		console.log(`${socket.userId} is Reconnected to the server`);
		db.query(availabilityReconnect);
	});

	// Join 1 on 1 chat room
	socket.on("join chatroom", async (displayname) => {
		// lookup friendship id
		try {
			const friendshipId = await getFriendshipId(socket.userId, displayname);
			const roomId = `chatroom-${friendshipId}`;

			// If already in a room
			if (chatRoom) {
				if (chatRoom === roomId) {
					console.log("Already in this room");
				} else {
					socket.leave(chatRoom);
					socket.join(roomId);
					chatRoom = roomId;
				}
			} else {
				socket.join(roomId);
				chatRoom = roomId;
			}

			// emit room joined event
			io.to(socket.id).emit("room joined", roomId);
		} catch (error) {
			console.error("Error joining chatoom: ", error);
		}
	});

	// sending a message
	socket.on("send message", async ({ displayname, message }) => {
		try {
			const insertedMessage = await insertMessage(
				socket.userId,
				displayname,
				message,
			);

			const returnMessage = {
				author: message.author,
				content: insertedMessage[0].content,
				timestamp: insertedMessage[0].timestamp,
			};
			console.log(returnMessage);
			// send the message event to other person thats in the room
			io.to(chatRoom).emit("receive message", returnMessage);
		} catch (error) {
			console.log(error);
			console.log("Error in inserting message");
		}
	});

	socket.on("join server", async (serverId) => {
		const server = `server-${serverId}`;
		try {
			const isMember = await checkServerMember(socket.userId, serverId);

			if (isMember) {
				if (serverRoom && serverRoom !== server) {
					socket.leave(serverRoom);
				}
				socket.join(server);
				serverRoom = server;

				// make copy of room change sets to arrays to send
				const members = {};
				for (let room in serverVoiceRooms[serverId]) {
					const channelIdMatch = room.match(/voiceroom-(\d+)-(\d+)/);
					const [, , channelId] = channelIdMatch;
					members[channelId] = [...serverVoiceRooms[serverId][room]];
				}
				// send current members of every voice channel of that server
				if (serverVoiceRooms[serverId]) {
					io.to(server).emit("joined voice room", {
						members,
					});
				}
			} else {
				console.log("Not a member of this server");
			}
		} catch (error) {
			console.error("Error:", error);
			console.log("Error in join server socket");
		}
	});

	// group chat events
	socket.on("join group chat", async ({ serverId, channelId }) => {
		let roomId = `chatroom-${serverId}-${channelId}`;
		// If already in a room
		if (chatRoom) {
			if (chatRoom === roomId) {
				console.log("Already in this room");
			} else {
				socket.leave(chatRoom);
				socket.join(roomId);
				chatRoom = roomId;
			}
		} else {
			socket.join(roomId);
			chatRoom = roomId;
		}
	});

	socket.on("send group message", async ({ message, channelId }) => {
		try {
			const insertedMessage = await insertGroupMessage(
				socket.userId,
				message,
				channelId,
			);

			const returnMessage = {
				author: socket.displayname,
				content: insertedMessage.content,
				timestamp: insertedMessage.timestamp,
			};

			// Send message to everyone in the room.
			io.to(chatRoom).emit("receive group message", returnMessage);
		} catch (error) {
			console.log(error);
		}
	});

	// group voice chat events
	socket.on("join group voice chat", async ({ serverId, channelId }) => {
		let roomId = `voiceroom-${serverId}-${channelId}`;

		// Create the server if it doesn't exist in serverVoiceRooms
		if (!serverVoiceRooms[serverId]) {
			serverVoiceRooms[serverId] = {};
		}
		// Create the server if it doesn't exist in serverVoiceRooms
		if (!serverVoiceRoomsIds[serverId]) {
			serverVoiceRoomsIds[serverId] = {};
		}

		// Create a Set for the voice room if it doesn't exist
		if (!serverVoiceRooms[serverId][roomId]) {
			serverVoiceRooms[serverId][roomId] = new Set();
		}

		// Create a Set for the voice room if it doesn't exist
		if (!serverVoiceRoomsIds[serverId][roomId]) {
			serverVoiceRoomsIds[serverId][roomId] = new Set();
		}

		let newRoom = true;

		// If already in a room
		if (voiceRoom) {
			if (voiceRoom === roomId) {
				console.log("Already in this room");
				newRoom = false;
			} else {
				if (currentVoiceServer) {
					// Remove the user from the current voice room set
					serverVoiceRooms[currentVoiceServer][voiceRoom].delete(
						socket.displayname,
					);
					serverVoiceRoomsIds[currentVoiceServer][voiceRoom].delete(
						socket.userId,
					);

					// make copy of room change sets to arrays to send
					let members = {};
					for (let room in serverVoiceRooms[currentVoiceServer]) {
						const channelIdMatch = room.match(/voiceroom-(\d+)-(\d+)/);
						const [, , channelId] = channelIdMatch;
						members[channelId] = [
							...serverVoiceRooms[currentVoiceServer][room],
						];
					}

					// Send current members of every voice channel of that server
					if (serverVoiceRooms[currentVoiceServer]) {
						io.to(`server-${currentVoiceServer}`).emit(
							"joined voice room",
							{
								members,
							},
						);
					}
				}
				socket
					.to(voiceRoom)
					.emit("left group voice chat", String(socket.userId));

				socket.leave(voiceRoom);
				socket.join(roomId);
				voiceRoom = roomId;

				// Add the user that joined the room to the room variable as well as id
				serverVoiceRooms[serverId][voiceRoom].add(socket.displayname);
				serverVoiceRoomsIds[serverId][voiceRoom].add(socket.userId);
				currentVoiceServer = serverId;

				// make copy of room change sets to arrays to send
				let members = {};
				for (let room in serverVoiceRooms[currentVoiceServer]) {
					const channelIdMatch = room.match(/voiceroom-(\d+)-(\d+)/);
					const [, , channelId] = channelIdMatch;
					members[channelId] = [
						...serverVoiceRooms[currentVoiceServer][room],
					];
				}
				// Send current members of every voice channel of that server
				if (serverVoiceRooms[serverId]) {
					io.to(`server-${serverId}`).emit("joined voice room", {
						members,
					});
				}
				io.to(voiceRoom).emit("joined group voice chat");
			}
		} else {
			socket.join(roomId);
			voiceRoom = roomId;
			serverVoiceRooms[serverId][voiceRoom].add(socket.displayname);
			serverVoiceRoomsIds[serverId][voiceRoom].add(socket.userId);
			currentVoiceServer = serverId;

			// make copy of room change sets to arrays to send
			const members = {};
			for (let room in serverVoiceRooms[serverId]) {
				const channelIdMatch = room.match(/voiceroom-(\d+)-(\d+)/);
				const [, , channelId] = channelIdMatch;
				members[channelId] = [...serverVoiceRooms[serverId][room]];
			}
			io.to(voiceRoom).emit("joined group voice chat");

			// send current members of every voice channel of that server
			if (serverVoiceRooms[serverId]) {
				io.to(`server-${serverId}`).emit("joined voice room", {
					members,
				});
			}
		}
		if (newRoom) {
			const otherInVoiceRoom = Array.from(
				serverVoiceRoomsIds[currentVoiceServer][voiceRoom],
			).filter((id) => id !== socket.userId);

			socket.emit("all users", otherInVoiceRoom);
		}
	});

	socket.on("hang up", () => {
		// Remove the user from the current voice room set
		if (currentVoiceServer) {
			// Remove the user from the current voice room set
			serverVoiceRooms[currentVoiceServer][voiceRoom].delete(
				socket.displayname,
			);
			serverVoiceRoomsIds[currentVoiceServer][voiceRoom].delete(
				socket.userId,
			);

			// make copy of room change sets to arrays to send
			let members = {};
			for (let room in serverVoiceRooms[currentVoiceServer]) {
				const channelIdMatch = room.match(/voiceroom-(\d+)-(\d+)/);
				const [, , channelId] = channelIdMatch;
				members[channelId] = [
					...serverVoiceRooms[currentVoiceServer][room],
				];
			}

			// Send current members of every voice channel of that server
			if (serverVoiceRooms[currentVoiceServer]) {
				io.to(`server-${currentVoiceServer}`).emit("joined voice room", {
					members,
				});
			}
			currentVoiceServer = null;
		}

		// leave room
		if (voiceRoom) {
			io.to(voiceRoom).emit("left group voice chat", String(socket.userId));
			socket.leave(voiceRoom);
			voiceRoom = null;
		}
	});
});

server.listen(5000, () => {
	console.log("Server started on port 5000");
	db.connect(function (err) {
		if (err) {
			console.log("Failed to connect to database.");
			throw err;
		}
		console.log("Database connected");
	});
});
