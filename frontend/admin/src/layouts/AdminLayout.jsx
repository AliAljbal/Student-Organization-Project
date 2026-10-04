// src/layouts/AdminLayout.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 bg-gray-100 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
