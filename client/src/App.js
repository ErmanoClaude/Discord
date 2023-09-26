import { useState, useEffect } from 'react';

import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

// Routes
import Home from "./pages/home/Home";
import Login from "./pages/Login";
import Register from './pages/Register';

// Layout
import RootLayout from './layouts/RootLayout';

// Api request
import Axios from "axios";




const App = () => {
  Axios.defaults.withCredentials = true;

  // Set the logged in user
  const [user, setUser] = useState({});

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

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout user={user} />}>

        {/* Protect Routes */}
        <Route index element={<Home user={user} />}>

        </Route>

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