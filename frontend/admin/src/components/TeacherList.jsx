// src/components/TeacherList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import AdminLayout from '../layouts/AdminLayout';

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const token = localStorage.getItem('token');
  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('users/teachers/', authHeaders);
      setTeachers(res.data);
    } catch {
      setError('❌ Failed to fetch teachers.');
    }
  };

  const handleCreate = async () => {
    try {
      await api.post(
        'users/teachers/create/',
        { ...formData, user_type: 'teacher' },
        authHeaders
      );
      setShowForm(false);
      setFormData({ username: '', email: '', password: '', password2: '' });
      fetchTeachers();
    } catch (err) {
      const e = err.response?.data || '❌ Error creating teacher.';
      setError(JSON.stringify(e));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await api.delete(`users/teachers/${id}/delete/`, authHeaders);
      fetchTeachers();
    } catch {
      setError('❌ Failed to delete teacher.');
    }
  };

  const handleEditClick = (teacher) => {
    setEditingId(teacher.id);
    setEditData({ username: teacher.username, email: teacher.email });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(
        `users/teachers/${id}/update/`,
        { ...editData },
        authHeaders
      );
      setEditingId(null);
      setEditData({});
      fetchTeachers();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Failed to update teacher.');
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Teachers</h3>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => setShowForm(true)}
          >
            ➕ Add Teacher
          </button>
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <table className="w-full bg-white shadow rounded overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-b">
                {editingId === t.id ? (
                  <>
                    <td className="p-2">
                      <input
                        name="username"
                        value={editData.username}
                        onChange={handleEditChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name="email"
                        value={editData.email}
                        onChange={handleEditChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => saveEdit(t.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{t.username}</td>
                    <td className="p-2">{t.email}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Teacher Form */}
        {showForm && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Teacher</h2>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default TeacherList;
