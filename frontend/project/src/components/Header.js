import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ username }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <h1 className="text-xl font-semibold">HTMA Platform</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Welcome, {username}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 text-sm transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
