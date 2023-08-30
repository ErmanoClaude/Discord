import React, {useEffect, useState } from 'react';
import {
  createBrowserRouter,
  Routes, 
  Route, 
  Link, 
  NavLink,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom';



// Routes
import Home from "./pages/Home";
import Login from "./pages/Login";

// Layout
import RootLayout from './layouts/RootLayout';

const user = null;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout user={user}/>}>
      <Route index element={<Home />}></Route>
      <Route path='login' element={<Login />}></Route>
    </Route>
  )
)



const App = () => {

  const [backendData, setBackendData] = useState([{}]);
  
  return (
    <RouterProvider router={router} />
  )
}

export default App;