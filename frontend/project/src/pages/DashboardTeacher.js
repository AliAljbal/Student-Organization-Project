/*project/ Dashboard Student.js*/
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Notification from '../components/Notification';
import api from '../services/api';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DashboardTeacher() {
  const [tab, setTab] = useState('create');
  const [username, setUsername] = useState('');
  const [notification, setNotification] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    academic_year: '',
    specialization: '',
    room: '',
    course: '',
    date: '',
    start_time: '',
  });

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const specializationOptions = {
    'First Year': ['None'],
    'Second Year': ['None'],
    'Third Year': ['None'],
    'Fourth Year': ['IT', 'CESE', 'CTE'],
    'Fifth Year': ['IT', 'CESE', 'CTE'],
  };

  const currentSpecs = specializationOptions[form.academic_year] || [];

  useEffect(() => {
    if (token) fetchInitialData();
  }, [token]);

  useEffect(() => {
    if (form.academic_year && form.specialization) {
      fetchCourses(form.academic_year, form.specialization);
    }
  }, [form.academic_year, form.specialization]);

  const fetchInitialData = async () => {
    try {
      const [profile, available, sessionList, years] = await Promise.all([
        api.get('/users/profile/', authHeaders),
        api.get('/rooms/available/', authHeaders),
        api.get('/sessions/teacher/', authHeaders),
        api.get('/sessions/academic-years/', authHeaders),
      ]);
      setUsername(profile.data.username);
      setAvailableRooms(available.data);
      setSessions(sessionList.data);
      setAcademicYears(years.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCourses = async (year, spec) => {
    try {
      const res = await api.get(
        `/sessions/courses/?year=${encodeURIComponent(year)}&specialization=${encodeURIComponent(spec)}`,
        authHeaders
      );
      setCourses(res.data);
    } catch {
      setCourses([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'academic_year') {
      const defaultSpec = (specializationOptions[value] || [])[0] || '';
      setForm({ ...form, academic_year: value, specialization: defaultSpec });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/sessions/teacher/', form, authHeaders);
      setNotification('✅ Session created successfully!');
      setForm({ academic_year: '', specialization: '', room: '', course: '', date: '', start_time: '' });
      fetchInitialData();
    } catch {
      setNotification('❌ Failed to create session.');
    } finally {
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleEndSession = async (id) => {
    try {
      await api.post(`/sessions/teacher/end/${id}/`, null, authHeaders);
      setNotification('✅ Session ended.');
      fetchInitialData();
    } catch {
      setNotification('❌ Failed to end session.');
    } finally {
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleUnreserveStudent = async (sessionId, studentName) => {
    try {
      await api.post(`/sessions/teacher/unreserve/${sessionId}/${encodeURIComponent(studentName)}/`, {}, authHeaders);
      setNotification('✅ Reservation removed.');
      fetchInitialData();
    } catch {
      setNotification('❌ Failed to remove reservation.');
    } finally {
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const downloadPDF = (session) => {
    const doc = new jsPDF();
    const { course, room, date, reserved_students, start_time } = session;

    doc.setFontSize(14);
    doc.text(`Students who attended ${course} in ${room} at ${start_time}`, 14, 20);

    const tableData = reserved_students.map((s, i) => [i + 1, s.name, s.student_id]);

    autoTable(doc, {
      head: [['#', 'Student Name', 'University Number']],
      body: tableData,
      startY: 30,
    });

    doc.save(`${course}-${room}-${date}.pdf`);
  };

  const renderTabContent = () => {
    switch (tab) {
      case 'create':
        return (
          <div className="grid gap-4 max-w-xl">
            <select name="academic_year" value={form.academic_year} onChange={handleChange} className="border p-2 rounded">
              <option value="">Select Academic Year</option>
              {academicYears.map((year, idx) => (
                <option key={idx} value={year}>{year}</option>
              ))}
            </select>

            <select name="specialization" value={form.specialization} onChange={handleChange} className="border p-2 rounded">
              <option value="">Select Specialization</option>
              {currentSpecs.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>

            <select name="room" value={form.room} onChange={handleChange} className="border p-2 rounded">
              <option value="">Select Room</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.name}>{room.name}</option>
              ))}
            </select>

            <select name="course" value={form.course} onChange={handleChange} className="border p-2 rounded">
              <option value="">Select Course</option>
              {courses.map((course, idx) => (
                <option key={idx} value={course}>{course}</option>
              ))}
            </select>

            <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />
            <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="border p-2 rounded" />

            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              Create Session
            </motion.button>
          </div>
        );

      case 'available':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Available Rooms</h3>
            {availableRooms.length === 0 ? (
              <p>No rooms available.</p>
            ) : (
              availableRooms.map((room) => (
                <div key={room.id} className="p-4 border bg-green-100 rounded shadow-sm">
                  <strong>{room.name}</strong> — {room.seats} seats
                </div>
              ))
            )}
          </div>
        );

      case 'reserved':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Reserved Rooms</h3>
            {sessions.map((s) => (
              <div key={s.id} className="p-4 border bg-red-50 rounded shadow-sm">
                <h4 className="text-indigo-700 font-semibold">
                  Students from {s.academic_year} specialization:
                   {s.specialization} attended {s.course} in room {s.room} at {s.start_time}
                </h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">#</th>
                        <th className="border p-2">Student Name</th>
                        <th className="border p-2">University Number</th>
                        <th className="border p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.reserved_students.map((student, idx) => (
                        <tr key={idx}>
                          <td className="border p-2">{idx + 1}</td>
                          <td className="border p-2">{student.name}</td>
                          <td className="border p-2">{student.student_id}</td>
                          <td className="border p-2">
                            <button
                              onClick={() => handleUnreserveStudent(s.id, student.name)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Unreserve student"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {s.reserved_students.length > 0 && (
                  <motion.button
                    onClick={() => downloadPDF(s)}
                    whileHover={{ scale: 1.05 }}
                    className="mt-3 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Download PDF
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        );

      case 'sessions':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">My Sessions</h3>
            {sessions.map((s) => (
              <div key={s.id} className="p-4 border bg-blue-100 rounded shadow-sm">
                <p><strong>Course:</strong> {s.course}</p>
                <p><strong>Room:</strong> {s.room}</p>
                <p><strong>Year:</strong> {s.academic_year}</p>
                <p><strong>Date:</strong> {s.date}</p>
                <p><strong>Start Time:</strong> {s.start_time}</p>
                <motion.button
                  onClick={() => handleEndSession(s.id)}
                  whileHover={{ scale: 1.05 }}
                  className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  End Session
                </motion.button>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Header username={username} />
      <div className="p-6 max-w-5xl mx-auto">
        <Notification message={notification} />
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={() => setTab('create')} className={tab === 'create' ? activeBtn : inactiveBtn}>Create Session</button>
          <button onClick={() => setTab('available')} className={tab === 'available' ? activeBtn : inactiveBtn}>Available Rooms</button>
          <button onClick={() => setTab('reserved')} className={tab === 'reserved' ? activeBtn : inactiveBtn}>Reserved Rooms</button>
          <button onClick={() => setTab('sessions')} className={tab === 'sessions' ? activeBtn : inactiveBtn}>My Sessions</button>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
}

const activeBtn = 'bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition';
const inactiveBtn = 'bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition';

export default DashboardTeacher;
