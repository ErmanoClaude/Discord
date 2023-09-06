import {
  createBrowserRouter, 
  Route, 
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom';

// Routes
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from './pages/Register';

// Layout
import RootLayout from './layouts/RootLayout';

const user = null;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout user={user}/>}>
      <Route index element={<Home />}></Route>
      <Route path='login' element={<Login />}></Route>
      <Route path='register' element={<Register />}></Route>
    </Route>
  )
)



const App = () => {  
  return (
    <RouterProvider router={router} />
  )
}

export default App;