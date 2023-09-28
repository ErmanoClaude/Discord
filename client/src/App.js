import { useState, useEffect } from 'react';

import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

// Routes
import Login from "./pages/Login";
import Register from './pages/Register';

// Layout
import RootLayout from './layouts/RootLayout';
import HomeLayout from "./layouts/HomeLayout";
import ServerLayout from './layouts/ServerLayout';
// Api request
import Axios from "axios";




const App = () => {
  Axios.defaults.withCredentials = true;

  // Set the logged in user
  const [user, setUser] = useState({});
  const [servers, setServers] = useState([]);
  const updateServers = (newServers) => {
    setServers(newServers);
  }

  async function fetchServers() {
    const res = await fetch('/servers', {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem('token')
      },
    });
    const dat = await res.json();
    setServers(dat.servers);
  }

  // Checked if user is logged in if not logged in get redirected to login or register
  useEffect(() => {

    async function fetchData() {
      const response = await fetch('/login', {
        method: 'GET'
      });
      const data = await response.json();
      if (data.loggedIn === true) {
        console.log('check user logged in')
        setUser(data.user.userId);

        // Set Servers if they logged in
        fetchServers();

      } else {
        if (window.location.pathname !== '/login') {
          if (window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
      }
    }

    fetchData();
  }, [])



  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout user={user} />}>

        {/* Protect Routes */}
        <Route index element={<HomeLayout user={user} servers={servers} fetchServers={fetchServers} />}></Route>
        <Route path="servers/:serverId" element={<ServerLayout servers={servers} fetchServers={fetchServers} />} />

        {/* Public Routes*/}
        <Route path='login' element={<Login updateServers={updateServers} />}></Route>
        <Route path='register' element={<Register />}></Route>
      </Route>
    )
  )


  return (
    <RouterProvider router={router} />
  )
}

export default App;