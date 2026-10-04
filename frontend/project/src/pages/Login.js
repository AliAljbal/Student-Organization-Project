// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/users/login/', {
        username: username,
        password: password,
      });

      const token = res.data.access;
      localStorage.setItem('token', token);

      const profile = await api.get('/users/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const type = profile.data.user_type;
      if (type === 'teacher') navigate('/teacher');
      else if (type === 'student') navigate('/student');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4">
      <motion.div
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Welcome Back
        </h2>

        {error && (
          <motion.div
            className="text-red-500 text-sm text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your full name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <motion.button
          onClick={handleLogin}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Login
        </motion.button>

        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
