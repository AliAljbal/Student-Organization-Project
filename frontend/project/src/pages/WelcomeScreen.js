import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4">
      <motion.div
        className="text-center text-white space-y-6"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold drop-shadow-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Welcome to <span className="text-yellow-300">HTMA</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Manage classes and sessions the smart way!
        </motion.p>

        <motion.button
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full shadow-xl hover:bg-gray-100 transition-all"
        >
          Start
        </motion.button>
      </motion.div>
    </div>
  );
}

export default WelcomeScreen;
