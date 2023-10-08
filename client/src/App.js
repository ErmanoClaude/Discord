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

// outlets
import Chats from "./components/Chats";

// Layout
import RootLayout from "./layouts/RootLayout";
import HomeLayout from "./layouts/HomeLayout";
import ServerLayout from "./layouts/ServerLayout";

import { io } from "socket.io-client";

import jwt_decode from "jwt-decode";
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
      .then((result) => result.json())
      .then((data) => {
        setFriends(data.friends);
      })
      .catch((err) => {
        console.log(err);
        console.log("Error in fetching friends");
      });
  }

  function connectSocket() {
    const newSocket = io("http://localhost:5000");

    newSocket.auth = { token: localStorage.getItem("token") };
    newSocket.connect();

    // event handlers
    newSocket.on("connect", () => {
      console.log("We are connected to backend");
    });

    setSocket(newSocket); // Set the socket after it's initialized
  }

  // Checked if user is logged in if not logged in get redirected to login or register
  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/login", {
        method: "GET",
      });
      const data = await response.json();
      if (data.loggedIn === true) {
        setUser(data.user.userId);
        setIsLoggedIn(true);

        // Set Servers if they logged in
        fetchServers();
      } else {
        // Redirect user if not logged in to '/login page or /register
        if (window.location.pathname !== "/login") {
          if (window.location.pathname !== "/register") {
            window.location.href = "/login";
          }
        }
      }
    }
    fetchData();

    if (setIsLoggedIn) {
      connectSocket();
    }
  }, []);

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
            element={<Home friends={friends} />}></Route>
          <Route
            path='message/:displayname'
            element={<Chats socket={socket} />}></Route>
        </Route>
        <Route
          path='servers/:serverId'
          element={
            <ServerLayout
              servers={servers}
              fetchServers={fetchServers}
            />
          }
        />

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
