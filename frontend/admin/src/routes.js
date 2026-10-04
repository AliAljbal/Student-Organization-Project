import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeacherList from './components/TeacherList';
import StudentList from './components/StudentList';
import RoomList from './components/RoomList';
import CourseList from './components/CourseList'; // ✅ إضافة هذا السطر

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin/teachers" element={<PrivateRoute><TeacherList /></PrivateRoute>} />
      <Route path="/admin/students" element={<PrivateRoute><StudentList /></PrivateRoute>} />
      <Route path="/admin/rooms" element={<PrivateRoute><RoomList /></PrivateRoute>} />
      <Route path="/admin/courses" element={<PrivateRoute><CourseList /></PrivateRoute>} /> {/* ✅ هذا هو المطلوب */}
    </Routes>
  );
}

export default AppRoutes;
