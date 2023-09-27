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
  const [servers, setServers] = useState([])

  // Checked if user is logged in if not logged in get redirected to login or register
  useEffect(() => {

    /* Axios.get('/login').then((response) => {
       if (response.data['loggedIn']) {
         setUser(response.data.user.userId);
       } else {
         if (window.location.pathname !== '/login') {
           if( window.location.pathname !== '/register' ) {
             window.location.href='/login'
           }
         }
       }
     }).catch((err) => {
       console.log(err);
       console.log("Error is App.js line 45")
     }) */

    async function fetchData() {
      const response = await fetch('/login', {
        method: 'GET'
      });
      const data = await response.json();
      if (data.loggedIn === true) {
        setUser(data.user.userId);
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

  // Get the servers the user is when user is changed
  async function fetchServers() {
    const response = await fetch('/servers', {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem('token')
      },
    });
    const data = await response.json();
    setServers(data.servers)
  }

  useEffect(() => {
    fetchServers();
  }, [user])

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout user={user} />}>

        {/* Protect Routes */}
        <Route index element={<HomeLayout user={user} servers={servers} fetchServers={fetchServers} />}></Route>
        <Route path="servers/:serverId" servers={servers} fetchServers={fetchServers} element={<ServerLayout />} />

        {/* Public Routes*/}
        <Route path='login' element={<Login />}></Route>
        <Route path='register' element={<Register />}></Route>
      </Route>
    )
  )


  return (
    <RouterProvider router={router} />
  )
}

export default App;