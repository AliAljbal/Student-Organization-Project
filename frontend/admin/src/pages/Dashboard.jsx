// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TeacherList from '../components/TeacherList';
import StudentTabs from '../components/StudentList';
import CourseList from '../components/CourseList';
import RoomList from '../components/RoomList';
import { motion } from 'framer-motion';

function Dashboard() {
  const [tab, setTab] = useState('');

  const renderTab = () => {
    switch (tab) {
      case 'teachers':
        return <TeacherList />;
      case 'students':
        return <StudentTabs />;
      case 'courses':
        return <CourseList />;
      case 'rooms':
        return <RoomList />;
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mt-24"
          >
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-4 tracking-tight">
              🎉 Welcome, Admin!
            </h1>
            <p className="text-gray-700 text-lg mb-2">
              Manage <span className="font-medium text-blue-600">teachers</span>,{' '}
              <span className="font-medium text-blue-600">students</span>,{' '}
              <span className="font-medium text-blue-600">courses</span> and{' '}
              <span className="font-medium text-blue-600">rooms</span> — all in one place.
            </p>
            <p className="text-indigo-500 mt-2 text-sm">Choose a tab from the sidebar to get started.</p>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-sky-100 via-white to-indigo-100">
      <Sidebar currentTab={tab} setTab={setTab} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white shadow-2xl rounded-2xl p-8 border border-indigo-100"
          >
            {renderTab()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
