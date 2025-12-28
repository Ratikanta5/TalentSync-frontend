import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'
import React from 'react'
import toast from 'react-hot-toast'

const HomePage = () => {

    return (
    <div>  <button className='btn btn-primary' onClick={()=>{toast.error("This is a success toast")}}>Click me!</button>

      <SignedOut>
        <SignInButton mode='modal'>
            <button>
              Login
            </button>
          </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <SignedIn>
        <UserButton />
      </SignedIn></div>
  )
}

export default HomePage