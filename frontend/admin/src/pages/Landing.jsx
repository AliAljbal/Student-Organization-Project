// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-800 text-white">
      <motion.h1
        className="text-5xl font-extrabold mb-6"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Welcome to Admin Dashboard
      </motion.h1>
      <motion.p
        className="text-xl mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Manage Students, Teachers, Courses, and Rooms
      </motion.p>
      <motion.button
        onClick={() => navigate('/login')}
        whileHover={{ scale: 1.1 }}
        className="bg-white text-indigo-700 px-6 py-3 rounded font-bold shadow-lg hover:bg-gray-100 transition"
      >
        Get Started
      </motion.button>
    </div>
  );
}

export default Landing;
