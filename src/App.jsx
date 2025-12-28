import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/HomePage';
import ProblemsPage from './pages/ProblemsPage';
import { useUser } from '@clerk/clerk-react';
import {Toaster} from 'react-hot-toast';

function App() {

  const { isSignedIn } = useUser(); //useUser() is a clerk hook use to find the details of current login user.

  return (
    <>
      <Routes>

        <Route path='/' element={<HomePage />} />
        <Route path='/problems' element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
      </Routes>
      <Toaster toastOptions={{duration:3000}}/>
    </>
  )
}

export default App;

//we successfully setup tailwind, react-router, daisyui, react-hot-toast, 
// todo: react query aka tonstack query, axios (i use better comments extension for this stylish commenting).