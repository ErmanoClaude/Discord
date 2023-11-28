import { useState, useEffect } from "react";
import {
	createBrowserRouter,
	Route,
	createRoutesFromElements,
	RouterProvider,
} from "react-router-dom";

// Routes
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Server from "./pages/Server";

// outlets
import Chats from "./components/Chats";
import GroupChat from "./components/GroupChat";
import GroupVoiceChat from "./components/GroupVoiceChat";

// Layouts
import RootLayout from "./layouts/RootLayout";
import HomeLayout from "./layouts/HomeLayout";
import ServerLayout from "./layouts/ServerLayout";

// 404 page
import Error404 from "./pages/Error404";

import { io } from "socket.io-client";
import { Peer } from "peerjs";
import { set } from "date-fns";

// Connect to webSocket server backend
const App = () => {
	// Set the logged in user
	const [user, setUser] = useState({});
	const [servers, setServers] = useState([]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [socket, setSocket] = useState();
	const [socketId, setSocketId] = useState(false);
	const [displayname, setDisplayname] = useState(false);
	const [stream, setStream] = useState(false);
	const [audioTrack, setAudioTrack] = useState(false);
	const [videoTrack, setVideoTrack] = useState(false);
	// Friends includes friends request that are pending
	// Format of friends
	// [{displayName: 'displayName', status:'pending', availability: 'offline'},
	// [{displayName: 'displayName', status:'accepted', availability:'online'},
	const [friends, setFriends] = useState([]);
	const [peers, setPeers] = useState({});
	const [myPeer, setMyPeer] = useState(false);
	const [usersToCall, setUsersToCall] = useState(false);
	const API_URL = process.env.REACT_APP_API_URL;
	const updateServers = (newServers) => {
		setServers(newServers);
	};

	async function backendHello() {
		const res = await fetch(`${API_URL}/hello`, {
			method: "GET",
		});
		console.log(res);
		console.log(API_URL);
	}

	async function getDisplay(id) {
		const res = await fetch(`${API_URL}/getname/${id}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});
		const data = await res.json();
		return new Promise((resolve, reject) => {
			if (data.success) {
				resolve(data);
			} else {
				reject("Failed to get Display of call");
			}
		});
	}

	async function fetchServers() {
		const res = await fetch(API_URL + "/servers", {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});
		const dat = await res.json();
		setServers(dat.servers);
	}
	async function fetchFriends() {
		await fetch(API_URL + "/friends", {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		})
			.then((result) => {
				return result.json();
			})
			.then((data) => {
				console.log(data.friends);
				setFriends(data.friends);
			})
			.catch((err) => {
				console.log(err);
				console.log("Error in fetching friends");
			});
	}

	async function connectSocket() {
		const token = localStorage.getItem("token");

		if (!token) {
			// No token, handle accordingly redirect to login
			if (window.location.pathname !== "/login") {
				if (window.location.pathname !== "/register") {
					window.location.href = "/login";
				}
			}
			return;
		}

		const newSocket = io("ws://localhost:5000");

		newSocket.auth = { token: localStorage.getItem("token") };
		newSocket.connect();

		// event handlers
		newSocket.on("connect", () => {
			console.log("We are connected to backend");
		});

		newSocket.on("init", (init) => {
			console.log("socket init", myPeer, stream);
			setSocketId(init.id);
			setDisplayname(init.displayname);
			connectStream(init.id);
		});
		newSocket.on("all users", (userIds) => {
			setUsersToCall(userIds);
		});
		newSocket.on("error", (error) => {
			// Handle the error or suppress it
			console.error("WebSocket error:", error);
			if (error.message.startsWith("Authentication Error")) {
				// Redirect user to the login page
				// Token is invalid, handle accordingly (e.g., redirect to login)
				if (window.location.pathname !== "/login") {
					if (window.location.pathname !== "/register") {
						window.location.href = "/login";
					}
				}
			}
			console.log(error);
		});

		newSocket.on("left group voice chat", (leaverId) => {
			if (peers) {
				setPeers((prevPeers) => {
					prevPeers[leaverId]?.close();
					const updatePeers = { ...prevPeers };
					delete updatePeers[leaverId];
					return updatePeers;
				});
			}
		});
		setSocket(newSocket); // Set the socket after it's initialized
	}

	function connectPeer(stream, socketId) {
		console.log("connecting PEer", stream, socketId);
		if (stream !== false && socketId !== false) {
			const newPeer = new Peer(socketId, {
				host: "localhost",
				port: 9000,
				path: "/peerjs",
				metadata: { name: displayname },
			});

			newPeer.on("open", () => {
				console.log("the peer is open");
			});
			newPeer.on("call", (call) => {
				// Answer the call and send your stream
				call.answer(stream);

				console.log("call from", call);

				// Handle call close event
				call.on("close", () => {
					console.log("Call closed");
					setPeers((prevPeers) => {
						const updatePeers = { ...prevPeers };
						delete updatePeers[call.peer];
						return updatePeers;
					});

					// remove them from connections map.
					// delete myPeer._connections[call.peer];
				});

				call.on("stream", (remoteStream) => {
					getDisplay(call.peer)
						.then((result) => {
							call.metadata = { displayname: result.displayname };
							setPeers((prevPeers) => {
								const allPeers = { ...prevPeers };
								allPeers[call.peer] = call;
								return allPeers;
							});
						})
						.catch((error) => {
							console.log("error");
						});
				});
			});

			newPeer.on("error", (error) => {
				console.log(error);
				console.log(newPeer);
			});

			newPeer.on("close", () => {
				Object.keys(peers).forEach((peer) => {
					peers[peer].close();
				});
				console.log("Peers after logged out:", peers);
			});

			setMyPeer(newPeer);
		}
	}

	function connectStream(id = socketId) {
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true,
			})
			.then((mediaStream) => {
				setStream(mediaStream);
				setAudioTrack(mediaStream.getAudioTracks()[0]);
				setVideoTrack(mediaStream.getVideoTracks()[0]);
				return mediaStream;
			})
			.then((mediaStream) => {
				connectPeer(mediaStream, id);
			})
			.catch((err) => {
				console.error("Error accessing media devices:", err);
			});
	}

	// Checked if user is logged in if not logged in get redirected to login or register
	useEffect(() => {
		async function fetchData() {
			const token = localStorage.getItem("token");

			if (!token) {
				// No token, handle accordingly redirect to login
				if (window.location.pathname !== "/login") {
					if (window.location.pathname !== "/register") {
						window.location.href = "/login";
					}
				}
				return;
			}

			const response = await fetch(API_URL + "/isUserAuth", {
				method: "GET",
				headers: {
					"x-access-token": token,
				},
			});

			const data = await response.json();

			if (data.success === true) {
				// Token is valid, set the user and proceed

				setUser(data.userId);
				setIsLoggedIn(true);

				// Set Servers if they logged in
				fetchServers();
			} else {
				// Token is invalid,  redirect to login
				if (window.location.pathname !== "/login") {
					if (window.location.pathname !== "/register") {
						window.location.href = "/login";
					}
				}
			}
		}

		fetchData();
		if (isLoggedIn) {
			connectSocket();
		}
		return () => {
			if (socket) {
				socket.off("all users");
				socket.off("connect");
				socket.off("error");
			}
		};
	}, [isLoggedIn]);

	useEffect(() => {
		try {
			if (usersToCall && socketId && stream && myPeer) {
				usersToCall.forEach((user) => {
					console.log("making call to", user);
					const call = myPeer.call(String(user), stream);

					call.on("close", () => {
						console.log("outgoing call closeed");
						setPeers((prevPeers) => {
							const updatePeers = { ...prevPeers };
							delete updatePeers[String(user)];
							return updatePeers;
						});

						// remove them from connections map.
						// delete myPeer._connections[call.peer];
					});

					call.on("stream", (remoteStream) => {
						getDisplay(call.peer)
							.then((result) => {
								call.metadata = { displayname: result.displayname };
								setPeers((prevPeers) => {
									const allPeers = { ...prevPeers };
									allPeers[String(user)] = call;
									return allPeers;
								});
							})
							.catch((error) => {
								console.log("error");
							});
					});
				});
			}
		} catch (error) {
			console.error(error);
		}
	}, [myPeer, socketId, stream, usersToCall]);

	const router = createBrowserRouter(
		createRoutesFromElements(
			<Route
				path='/'
				element={<RootLayout user={user} />}
			>
				{/* Protected Routes */}
				<Route
					path='/'
					element={
						<HomeLayout
							user={user}
							servers={servers}
							fetchServers={fetchServers}
							friends={friends}
							fetchFriends={fetchFriends}
							setFriends={setFriends}
							displayname={displayname}
							setIsLoggedIn={setIsLoggedIn}
							myPeer={myPeer}
							socket={socket}
						/>
					}
				>
					<Route
						index
						element={
							<Home
								friends={friends}
								fetchFriends={fetchFriends}
								fetchServers={fetchServers}
								setFriends={setFriends}
							/>
						}
					></Route>
					<Route
						path='message/:displayname'
						element={<Chats socket={socket} />}
					></Route>
				</Route>
				<Route
					path='servers/:serverId/:name'
					element={
						<ServerLayout
							servers={servers}
							fetchServers={fetchServers}
							socket={socket}
							displayname={displayname}
							setIsLoggedIn={setIsLoggedIn}
							myPeer={myPeer}
						/>
					}
				>
					<Route
						index
						element={
							<Server
								socket={socket}
								stream={stream}
							/>
						}
					></Route>
					<Route
						path='text/:channelId/:channelName'
						element={<GroupChat socket={socket} />}
					></Route>
					<Route
						path='voice/:channelId/:channelName'
						element={
							<GroupVoiceChat
								socket={socket}
								stream={stream}
								myPeer={myPeer}
								peers={peers}
								setPeers={setPeers}
								audioTrack={audioTrack}
								setAudioTrack={setAudioTrack}
								videoTrack={videoTrack}
								setVideoTrack={setVideoTrack}
							/>
						}
					></Route>
				</Route>

				{/* Public Routes*/}
				<Route
					path='login'
					element={
						<Login
							updateServers={updateServers}
							connectSocket={connectSocket}
						/>
					}
				></Route>
				<Route
					path='register'
					element={<Register />}
				></Route>
				<Route
					path='*'
					element={<Error404 />}
				/>
			</Route>,
		),
	);

	return <RouterProvider router={router} />;
};

export default App;
