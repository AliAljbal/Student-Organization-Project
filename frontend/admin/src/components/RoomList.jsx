// admin Rooms
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import AdminLayout from '../layouts/AdminLayout';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ name: '', seats: '' });
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [reservedRooms, setReservedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const [all, available, reserved] = await Promise.all([
        api.get('rooms/', authHeaders),
        api.get('rooms/available/', authHeaders),
        api.get('rooms/reserved/', authHeaders),
      ]);

      setRooms(all.data);
      setAvailableRooms(available.data);
      setReservedRooms(reserved.data);
    } catch (error) {
      alert('❌ Failed to fetch room data.');
      console.error('Error fetching rooms:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.seats) {
      alert('⚠️ Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      if (editingRoomId) {
        await api.put(`rooms/${editingRoomId}/`, form, authHeaders);
        alert('✅ Room updated successfully.');
      } else {
        await api.post('rooms/', form, authHeaders);
        alert('✅ Room added successfully.');
      }

      setForm({ name: '', seats: '' });
      setEditingRoomId(null);
      fetchRooms();
    } catch (error) {
      alert('❌ Failed to save room.');
      console.error('Error saving room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setForm({ name: room.name, seats: room.seats });
    setEditingRoomId(room.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await api.delete(`rooms/${id}/`, authHeaders);
      alert('🗑️ Room deleted.');
      fetchRooms();
    } catch (error) {
      alert('❌ Failed to delete room.');
      console.error('Error deleting room:', error);
    }
  };

  const handleReserve = async (roomId) => {
    try {
      await api.post(`rooms/${roomId}/reserve/`, {}, authHeaders);
      alert('✅ Room reserved successfully.');
      fetchRooms();
    } catch (error) {
      alert('❌ Failed to reserve room.');
      console.error(error);
    }
  };

  const handleCancelReservation = async (roomId) => {
    try {
      await api.post(`rooms/${roomId}/cancel_reservation/`, {}, authHeaders);
      alert('✅ Reservation cancelled.');
      fetchRooms();
    } catch (error) {
      alert('❌ Failed to cancel reservation.');
      console.error(error);
    }
  };

  const renderRoomList = (roomList, editable = false, reservationType = null) => {
    return roomList.length === 0 ? (
      <p className="text-gray-500">No rooms to display.</p>
    ) : (
      roomList.map((room) => (
        <div
          key={room.id}
          className={`flex items-center justify-between border p-3 mb-2 rounded shadow-sm bg-white ${
            editable ? '' : 'bg-opacity-70'
          }`}
        >
          <span>{room.name} — {room.seats} seats</span>
          <div className="flex gap-2">
            {editable && (
              <>
                <button onClick={() => handleEdit(room)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(room.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </>
            )}
            {reservationType === 'available' && (
              <button onClick={() => handleReserve(room.id)} className="bg-green-600 text-white px-3 py-1 rounded">
                Reserve
              </button>
            )}
            {reservationType === 'reserved' && (
              <button onClick={() => handleCancelReservation(room.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                Cancel Reservation
              </button>
            )}
          </div>
        </div>
      ))
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Room Management</h2>

        {/* Room Form */}
        <div className="mb-8 bg-white shadow rounded p-4">
          <h3 className="text-xl font-semibold mb-4">
            {editingRoomId ? 'Edit Room' : 'Add New Room'}
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="name"
              placeholder="Room name"
              value={form.name}
              onChange={handleChange}
              className="border p-2 flex-1 rounded"
            />
            <input
              type="number"
              name="seats"
              placeholder="Number of seats"
              value={form.seats}
              onChange={handleChange}
              className="border p-2 flex-1 rounded"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {loading ? 'Saving...' : editingRoomId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600'}`}
            >
              All Rooms
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 ${activeTab === 'available' ? 'border-b-2 border-green-600 text-green-600 font-semibold' : 'text-gray-600'}`}
            >
              Available Rooms
            </button>
            <button
              onClick={() => setActiveTab('reserved')}
              className={`px-4 py-2 ${activeTab === 'reserved' ? 'border-b-2 border-red-600 text-red-600 font-semibold' : 'text-gray-600'}`}
            >
              Reserved Rooms
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'all' && <div>{renderRoomList(rooms, true)}</div>}
          {activeTab === 'available' && <div>{renderRoomList(availableRooms, false, 'available')}</div>}
          {activeTab === 'reserved' && <div>{renderRoomList(reservedRooms, false, 'reserved')}</div>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default RoomManagement;
