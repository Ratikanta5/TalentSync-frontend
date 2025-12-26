import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'
import './App.css'

function App() {

  return (
    <>
      <h1>Welcome to the TalentSync</h1>
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
      </SignedIn>
    </>
  )
}

export default App
