/*project/ Dashboard Student.js*/
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import { motion } from 'framer-motion';

function DashboardStudent() {
  const [tab, setTab] = useState('notifications');
  const [notification, setNotification] = useState('');
  const [profile, setProfile] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [reservedRooms, setReservedRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSeats, setRoomSeats] = useState(null);
  const [roomStatus, setRoomStatus] = useState('');
  const previousNotification = useRef('');
  const audioRef = useRef(null);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchProfile();
    fetchRooms();
    const interval = setInterval(fetchStudentSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudentSession = async () => {
    try {
      const res = await api.get('/sessions/student/', authHeaders);
      if (res.data.length === 0) {
        setNotification('');
        setSelectedRoom(null);
        setRoomSeats(null);
        previousNotification.current = '';
        return;
      }

      const session = res.data[0];
      const roomObj = typeof session.room === 'object' ? session.room : { name: session.room, seats: null };
      const roomName = roomObj.name || 'Unknown';
      const seats = session.available_seats || roomObj.seats || null;

      const message = `📢 ${session.course} in ${roomName} at ${session.start_time.slice(0, 5)} on ${session.date}`;
      
      if (message !== previousNotification.current) {
        setNotification(message);
        previousNotification.current = message;
        playNotificationSound();
      }

      setSelectedRoom(roomName);
      setRoomSeats(seats);
    } catch {
      setNotification('');
      setSelectedRoom(null);
      setRoomSeats(null);
      previousNotification.current = '';
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
  }, []);

  const fetchProfile = () => {
    api.get('/users/profile/', authHeaders)
      .then(res => setProfile(res.data));
  };

  const fetchRooms = () => {
    api.get('/rooms/available/', authHeaders)
      .then(res => setAvailableRooms(res.data));

    api.get('/rooms/reserved/', authHeaders)
      .then(res => setReservedRooms(res.data));
  };

  const handleReserve = async () => {
    if (!selectedRoom) return;
    try {
      await api.post('/sessions/reserve-seat/', {
        room_name: selectedRoom
      }, authHeaders);
      setRoomStatus(`✅ Seat reserved in ${selectedRoom}`);
      fetchRooms();
    } catch {
      setRoomStatus('❌ Failed to reserve a seat or the room is full.');
    }
  };

  const renderTabContent = () => {
    if (tab === 'notifications') {
      return (
        <div className="space-y-4">
          <motion.div
            className="bg-yellow-50 border border-yellow-300 text-yellow-900 px-4 py-3 rounded shadow-sm text-sm font-medium"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {notification || '📭 No notifications yet'}
          </motion.div>

          {selectedRoom && roomSeats !== null && (
            <p className="text-sm text-gray-700">
              🪑 Available seats in <strong>{selectedRoom}</strong>: {roomSeats}
            </p>
          )}

          {selectedRoom && (
            <motion.button
              onClick={handleReserve}
              whileHover={{ scale: 1.05 }}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Reserve seat in {selectedRoom}
            </motion.button>
          )}

          {roomStatus && (
            <p className={`text-sm mt-2 ${roomStatus.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {roomStatus}
            </p>
          )}

          <audio ref={audioRef} src="/sounds/notify.mp3" preload="auto" />
        </div>
      );
    }

    if (tab === 'available') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">📌 Available Rooms</h3>
          {availableRooms.map(room => (
            <div key={room.id} className="p-4 border bg-green-100 rounded shadow-sm">
              <strong>{room.name}</strong> — {room.seats} seats
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'reserved') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">📌 Reserved Rooms</h3>
          {reservedRooms.map(room => (
            <div key={room.id} className="p-4 border bg-red-100 rounded shadow-sm">
              <strong>{room.name}</strong> — {room.seats} seats
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <Header username={profile.username} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-white border rounded p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-2">👤 Profile</h2>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Academic Year:</strong> {profile.academic_year}</p>
          <p><strong>Specialization:</strong> {profile.specialization || 'None'}</p>
          <p><strong>University Number:</strong> {profile.student_id || 'N/A'}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setTab('notifications')} className={tab === 'notifications' ? activeBtn : inactiveBtn}>Notifications</button>
          <button onClick={() => setTab('available')} className={tab === 'available' ? activeBtn : inactiveBtn}>Available Rooms</button>
          <button onClick={() => setTab('reserved')} className={tab === 'reserved' ? activeBtn : inactiveBtn}>Reserved Rooms</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
}

const activeBtn = "bg-indigo-600 text-white px-4 py-2 rounded font-semibold";
const inactiveBtn = "bg-gray-200 text-gray-700 px-4 py-2 rounded";

export default DashboardStudent;
