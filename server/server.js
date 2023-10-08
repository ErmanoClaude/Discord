const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const JWT = require("jsonwebtoken");

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
    origin: ["http://localhost:3000"],
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
const { getFriendshipId, insertMessage } = require("./services/dbqueries");

// Routes
app.use("/", authRoutes);
app.use("/", serverChannelRoutes);
app.use("/", friendsRoutes);
app.use("/message", chatsRoutes);

const server = app.listen(5000, function () {
  console.log("Server started on port 5000");

  // Connect to the data base
  db.connect(function (err) {
    if (err) {
      console.log("Failed to connect to database.");
      throw err;
    }
    console.log("Database connected");
  });
});

// Connect user to webSocket socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true, // Allows cookie to be enabled
  },
});

// Authenticate middle for socket.
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication Error"));
    }

    socket.userId = decoded.userId;
    next();
  });
});

let connectedUsers = 0;

io.on("connection", async (socket) => {
  console.log(`${socket.userId} is connected to the server`);
  // change availability to online
  const availability = `UPDATE users SET status = 'online' WHERE id=${socket.userId}`;
  db.query(availability);

  // disconnect
  socket.on("disconnect", async () => {
    const availabilityDisconnect = `UPDATE users SET status = 'offline' WHERE id=${socket.userId}`;
    console.log(`${socket.userId} is disconnected to the server`);
    db.query(availabilityDisconnect);
  });

  // Reconnect
  socket.on("reconnect", async () => {
    const availabilityReconnect = `UPDATE users SET status = 'online' WHERE id=${socket.userId}`;
    console.log(`${socket.userId} is Reconnected to the server`);
    db.query(availabilityReconnect);
  });

  // Join 1on 1 chat room
  socket.on("join chatroom", async (displayname) => {
    // lookup friendship id
    try {
      const friendshipId = await getFriendshipId(socket.userId, displayname);
      const roomId = `chatroom-${friendshipId}`;
      console.log(roomId);
      // join room
      socket.join("chatroom");

      // If already in a room
      const currentRoom = Object.keys(socket.rooms)[0];

      // emit room joined event
      io.to(socket.id).emit("room joined", roomId);

      console.log(currentRoom);
    } catch (error) {
      console.error("Error joining chatoom: ", error);
    }
  });

  // sending a message
  socket.on("send message", async ({ displayname, message }) => {
    try {
      await insertMessage(socket.userId, displayname, message);

      // send the message event to other person thats in the room

      socket.to(socket.roomId).emit("receive message", {
        author: message.author,
        content: message.content,
        time: message.now,
      });

      // Assume socket is the connected socket
      const currentRooms = Object.keys(socket.rooms);
      console.log(currentRooms);
    } catch (error) {
      console.log(error);
      console.log("Error in inserting message");
    }
  });
});
