// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navItem = (label, path) => (
    <Link
      to={path}
      className={`block px-4 py-2 rounded hover:bg-indigo-100 ${
        pathname === path ? 'bg-indigo-200 text-indigo-700 font-semibold' : 'text-gray-800'
      }`}
    >
      {label}
    </Link>
  );

  const handleLogout = () => {
    // حذف بيانات الأدمن من التخزين المحلي
    localStorage.removeItem('token');
    // يمكنك إضافة أي بيانات أخرى تحتاج لحذفها هنا

    // توجيه المستخدم إلى صفحة تسجيل الدخول
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-50 shadow-md min-h-screen p-4 space-y-4">
      <h2 className="text-lg font-bold text-indigo-700 mb-4">Navigation</h2>
      <h2 className="text-lg font-bold text-indigo-700 mb-8">Dashboard</h2>
      {navItem('Teachers', '/admin/teachers')}
      {navItem('Students', '/admin/students')}
      {navItem('Rooms', '/admin/rooms')}
      {navItem('Courses', '/admin/courses')}

      {/* زر Logout */}
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 rounded text-gray-800 hover:bg-red-100 hover:text-red-700"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
