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

  // Checked if user is logged in
  useEffect(() => {
    Axios.get('/login').then((response) => {
      if (response.data['loggedIn']) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.user.token);
      } else {
        if (window.location.pathname !== '/login') {
          if( window.location.pathname !== '/register' ) {
            window.location.href='/login'
          }
        }
      }
    })
  }, [])



  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout user={user}/>}>
  
        {/* Protect Routes */}
        <Route index element={<Home  user = {user}/>}>
          
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