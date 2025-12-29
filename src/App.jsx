import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/HomePage';
import ProblemsPage from './pages/ProblemsPage';
import { useUser } from '@clerk/clerk-react';
import {Toaster} from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';

function App() {

  const { isSignedIn, isLoaded } = useUser(); //useUser() is a clerk hook use to find the details of current login user.

  //this will get the rid of the flickering effect.
  if(!isLoaded) return null;

  return (
    <>
      <Routes>

        <Route path='/' element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"}/>} />
        <Route path='/dashboard' element={!isSignedIn ? <DashboardPage/> : <Navigate to={"/"}/>} />

        <Route path='/problems' element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
      </Routes>
      <Toaster toastOptions={{duration:3000}}/>
    </>
  )
}

export default App;

//we successfully setup tailwind, react-router, daisyui, react-hot-toast, 
