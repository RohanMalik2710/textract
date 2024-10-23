import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase.config';
import { useUser } from './UserContext';  // Import User Context
import drop from "../assets/drop1.jpg"
import "../qna.css"

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { isLoggedIn, setIsLoggedIn } = useUser();  // Access global state

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { user } = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);

      const userDataRef = doc(db, 'users', user.uid);
      const userDataSnap = await getDoc(userDataRef);

      if (userDataSnap.exists()) {
        setIsLoggedIn(true); // Set global logged-in state
        alert('Login successful!');  
      } else {
        setError('User not found in Firestore.');
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Wrong password.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else {
        setError(error.message);
      }
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/upload" />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6"
      style={{
        backgroundImage: `url(${drop})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-md w-full bg-black glass-effect p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-white neon-text">Login</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 neon-text">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 neon-text">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-base text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
