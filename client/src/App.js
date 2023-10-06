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

// Layout
import RootLayout from "./layouts/RootLayout";
import HomeLayout from "./layouts/HomeLayout";
import ServerLayout from "./layouts/ServerLayout";

import { io } from "socket.io-client";

// Connect to webSocket server backend
var socket = "";
const App = () => {
  // Set the logged in user
  const [user, setUser] = useState({});
  const [servers, setServers] = useState([]);
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
    const res = await fetch("/friends", {
      method: "GET",
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });
    const data = await res.json();
    setFriends(data.friends);
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

        // Set Servers if they logged in
        await fetchServers();

        // Set Friends
        await fetchFriends();

        // connect to socket and set token
        socket = io("http://localhost:5000");

        socket.auth = { token: localStorage.getItem("token") };
        socket.connect();

        // event handlers
        socket.on("connect", () => {
          console.log("We are connected to backend");
        });
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
            />
          }>
          <Route
            index
            element={<Home friends={friends} />}></Route>
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
          element={<Login updateServers={updateServers} />}></Route>
        <Route
          path='register'
          element={<Register />}></Route>
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};

export default App;
