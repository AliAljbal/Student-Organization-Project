import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomeScreen from './pages/WelcomeScreen';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardStudent from './pages/DashboardStudent';
import DashboardTeacher from './pages/DashboardTeacher';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student" element={<DashboardStudent />} />
        <Route path="/teacher" element={<DashboardTeacher />} />
      </Routes>
    </Router>
  );
}

export default App;
