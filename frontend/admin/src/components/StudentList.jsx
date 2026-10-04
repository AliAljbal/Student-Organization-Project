// src/pages/StudentManager.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import AdminLayout from '../layouts/AdminLayout';

const academicYears = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Fifth Year'];
const specializations = [ 'IT', 'CESE', 'CTE'];

export default function StudentManager() {
  const [year, setYear] = useState('First Year');
  const [specialization, setSpecialization] = useState('None');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newStudent, setNewStudent] = useState({
    username: '',
    email: '',
    student_id: '',
    password: '',
    password2: '',
  });

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchStudents = async () => {
    try {
      const res = await api.get(
        `users/students/?year=${encodeURIComponent(year)}&specialization=${encodeURIComponent(specialization)}`,
        authHeaders
      );
      setStudents(res.data);
      setError('');
    } catch {
      setError('Failed to fetch students.');
    }
  };

  useEffect(() => {
    if (['First Year', 'Second Year', 'Third Year'].includes(year)) {
      setSpecialization('None');
    }
    fetchStudents();
  }, [year, specialization]);

  const isValidUsername = (value) => /^[\w\s.@+-]*$/.test(value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username' && !isValidUsername(value)) {
      alert('Username can only include letters, numbers, spaces, and @/./+/-/_ characters.');
      return;
    }
    setNewStudent({ ...newStudent, [name]: value });
  };

  const addStudent = async () => {
    if (newStudent.password !== newStudent.password2) {
      alert('Passwords do not match.');
      return;
    }
    if (!newStudent.username || !newStudent.email || !newStudent.student_id) {
      alert('All fields are required.');
      return;
    }

    const payload = {
      ...newStudent,
      academic_year: year,
      specialization,
      user_type: 'student',
    };

    try {
      await api.post('users/students/create/', payload, authHeaders);
      setNewStudent({ username: '', email: '', student_id: '', password: '', password2: '' });
      fetchStudents();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Failed to add student.');
    }
  };

  const handleEditClick = (student) => {
    setEditingId(student.id);
    setEditData({ ...student });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username' && !isValidUsername(value)) {
      alert('Invalid username.');
      return;
    }
    setEditData({ ...editData, [name]: value });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(
        `users/students/${id}/update/`,
        editData,
        authHeaders
      );
      setEditingId(null);
      fetchStudents();
    } catch {
      alert('Failed to update student.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`users/students/${id}/delete/`, authHeaders);
      fetchStudents();
    } catch {
      alert('Failed to delete student.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-4">Student Management</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        {/* Academic Year Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {academicYears.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-2 rounded shadow ${year === y ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Specialization Tabs */}
        {['Fourth Year', 'Fifth Year'].includes(year) && (
          <div className="flex gap-2 mb-4">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecialization(spec)}
                className={`px-4 py-2 rounded shadow ${specialization === spec ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {spec}
              </button>
            ))}
          </div>
        )}

        {/* Add Student Form */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-xl font-bold mb-3">Add New Student</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input name="username" value={newStudent.username} onChange={handleInputChange} placeholder="Full Name" className="border p-2 rounded" />
            <input name="email" type="email" value={newStudent.email} onChange={handleInputChange} placeholder="Email" className="border p-2 rounded" />
            <input name="student_id" value={newStudent.student_id} onChange={handleInputChange} placeholder="Student ID" className="border p-2 rounded" />
            <input name="password" type="password" value={newStudent.password} onChange={handleInputChange} placeholder="Password" className="border p-2 rounded" />
            <input name="password2" type="password" value={newStudent.password2} onChange={handleInputChange} placeholder="Confirm Password" className="border p-2 rounded" />
            <button onClick={addStudent} className="bg-green-600 text-white rounded px-4 py-2">Add</button>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">University ID</th>
                <th className="p-2">Year</th>
                <th className="p-2">Specialization</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">No students found.</td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    {editingId === student.id ? (
                      <>
                        <td className="p-2"><input name="username" value={editData.username} onChange={handleEditChange} className="border rounded px-2" /></td>
                        <td className="p-2"><input name="email" value={editData.email} onChange={handleEditChange} className="border rounded px-2" /></td>
                        <td className="p-2"><input name="student_id" value={editData.student_id} onChange={handleEditChange} className="border rounded px-2" /></td>
                        <td className="p-2">{editData.academic_year}</td>
                        <td className="p-2">{editData.specialization}</td>
                        <td className="p-2 flex gap-2">
                          <button onClick={() => saveEdit(student.id)} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                          <button onClick={cancelEdit} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{student.username}</td>
                        <td className="p-2">{student.email}</td>
                        <td className="p-2">{student.student_id}</td>
                        <td className="p-2">{student.academic_year}</td>
                        <td className="p-2">{student.specialization}</td>
                        <td className="p-2 flex gap-2">
                          <button onClick={() => handleEditClick(student)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                          <button onClick={() => deleteStudent(student.id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
