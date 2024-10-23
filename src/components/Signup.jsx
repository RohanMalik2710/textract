import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase.config'; // Import auth and Firestore db from config
import { doc, setDoc } from 'firebase/firestore'; // Firestore functions
import drop from "../assets/drop2.jpg"
import "../qna.css"

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Function to handle form submission
  const handleSignup = async (event) => {
    event.preventDefault(); // Prevent page reload on form submit

    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    // Proceed with Firebase signup
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      console.log("User signed up:", user);
      setErrorMessage(null);

      // Add user details to the Firestore database
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
      });

      // Reset form after successful signup
      setEmail('');
      setPassword('');
      alert('Signup successful!');

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error("Error during signup:", error.message);
      setErrorMessage(error.message); // Display any errors that occur
    }
  };

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
        <h2 className="text-3xl font-bold mb-6 text-center text-white neon-text">Sign Up</h2>

        {/* Display any error messages */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSignup}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-base text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
