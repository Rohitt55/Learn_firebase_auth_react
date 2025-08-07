import React from 'react'
import { Link } from 'react-router'
import Logout from './components/Logout'


const App = () => {

  return (
    <>
    
      <div className='container p-5 mx-auto'>
          <nav className='mt-16 py-28 bg-slate-50'>
            <ul className='flex items-center justify-center space-x-4'>
              <li><Link to="/register" className='px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'>Register</Link></li>
              <li><Link to="/login" className='px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'>Login</Link></li>
              <li><Link to="/dashboard" className='px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'>Dashboard</Link></li>
              <li><Link to="/user-profile" className='px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'>Profile</Link></li>
              <li><Link to="/reset-password" className='px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'>Reset Password</Link></li>
              <li><Link to="/password-less-signin" className='px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'>PasswordLess Sign-in</Link></li>
            </ul>
          </nav>
          <Logout />
        </div>
    </>
  )
}

export default App