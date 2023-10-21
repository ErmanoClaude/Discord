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

// Layout
import RootLayout from "./layouts/RootLayout";
import HomeLayout from "./layouts/HomeLayout";
import ServerLayout from "./layouts/ServerLayout";

import { io } from "socket.io-client";

// Connect to webSocket server backend
const App = () => {
	// Set the logged in user
	const [user, setUser] = useState({});
	const [servers, setServers] = useState([]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [socket, setSocket] = useState();
	// Friends includes friends request that are pending
	// Format of friends
	// [{displayName: 'displayName', status:'pending', availability: 'offline'},
	// [{displayName: 'displayName', status:'accepted', availability:'online'},
	const [friends, setFriends] = useState([]);
	const updateServers = (newServers) => {
		setServers(newServers);
	};

	async function fetchServers() {
		const res = await fetch("/servers", {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});
		const dat = await res.json();
		setServers(dat.servers);
	}
	async function fetchFriends() {
		await fetch("/friends", {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		})
			.then((result) => {
				return result.json();
			})
			.then((data) => {
				setFriends(data.friends);
			})
			.catch((err) => {
				console.log(err);
				console.log("Error in fetching friends");
			});
	}

	function connectSocket() {
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
		});

		setSocket(newSocket); // Set the socket after it's initialized
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

			const response = await fetch("/isUserAuth", {
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
	}, [isLoggedIn]);

	const router = createBrowserRouter(
		createRoutesFromElements(
			<Route
				path='/'
				element={<RootLayout user={user} />}>
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
						/>
					}>
					<Route
						index
						element={
							<Home
								friends={friends}
								fetchFriends={fetchFriends}
								fetchServers={fetchServers}
							/>
						}></Route>
					<Route
						path='message/:displayname'
						element={<Chats socket={socket} />}></Route>
				</Route>
				<Route
					path='servers/:serverId/:name'
					element={
						<ServerLayout
							servers={servers}
							fetchServers={fetchServers}
						/>
					}>
					<Route
						index
						element={<Server socket={socket} />}></Route>
					<Route
						path='text/:channelId/:channelName'
						element={<GroupChat socket={socket} />}></Route>
					<Route
						path='voice/:channelId/:channelName'
						element={<GroupVoiceChat socket={socket} />}></Route>
				</Route>

				{/* Public Routes*/}
				<Route
					path='login'
					element={
						<Login
							updateServers={updateServers}
							connectSocket={connectSocket}
						/>
					}></Route>
				<Route
					path='register'
					element={<Register />}></Route>
			</Route>,
		),
	);

	return <RouterProvider router={router} />;
};

export default App;
