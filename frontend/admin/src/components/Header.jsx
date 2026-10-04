// src/components/Header.jsx
import React from 'react';

const Header = ({ username = {username}}) => {
  return (
    <div className="flex justify-end p-4 bg-white border-b">
      <span className="text-gray-600">Logged in as <strong>{username}</strong></span>
    </div>
  );
};

export default Header;
