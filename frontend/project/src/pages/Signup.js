/*project/ signup*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    academic_year: '',
    specialization: '',
    student_id: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [years, setYears] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  useEffect(() => {
    const headers = getAuthHeaders();
    const config = headers ? { headers } : {};

    api.get('/sessions/academic-years/', config)
      .then(res => setYears(res.data))
      .catch(() => {
        setYears([
          "First Year", "Second Year", "Third Year", "Fourth Year", "Fifth Year"
        ]);
      });
  }, []);

  useEffect(() => {
    if (["Fourth Year", "Fifth Year"].includes(formData.academic_year)) {
      const headers = getAuthHeaders();
      const config = headers ? { headers } : {};

      api.get('/sessions/specializations/', config)
        .then(res => {
          const specs = res.data.filter(spec => spec !== "None");
          setSpecializations(specs);
          if (!specs.includes(formData.specialization)) {
            setFormData(prev => ({ ...prev, specialization: '' }));
          }
        })
        .catch(() => {
          setSpecializations(["IT", "CESE", "ICTE"]);
          setFormData(prev => ({ ...prev, specialization: 'None' }));
        });
    } else {
      setSpecializations(["None"]);
      setFormData(prev => ({ ...prev, specialization: 'None' }));
    }
  }, [formData.academic_year]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    const {
      username, email, password,
      confirmPassword, academic_year, specialization, student_id
    } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The Passwords is not identical.');
      return;
    }

    if (!academic_year || !specialization || !student_id) {
      setError('Please fill in all student fields.');
      return;
    }

    const payload = {
      username,
      email,
      password,
      password2: confirmPassword,
    };

    payload.academic_year = academic_year;
    payload.specialization = specialization;
    payload.student_id = student_id;

    try {
      await api.post('/users/register/', payload);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        const message = error.response.data.detail || JSON.stringify(error.response.data);
        setError(`Registration failed: ${message}`);
      } else {
        setError('Registration failed. Please check your information and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center px-4">
      <motion.div
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">Create Account</h2>
        <p className="text-sm text-center text-gray-600 mb-4">
          Account type: Student. Teacher accounts are created by an administrator.
        </p>

        {error && (
          <motion.div className="text-red-500 text-sm text-center mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div className="text-green-600 text-sm text-center mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {success}
          </motion.div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <>
              <input
                type="text"
                name="student_id"
                placeholder="Unversity Number"
                value={formData.student_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Academic Year</option>
                {years.map((year, idx) => (
                  <option key={idx} value={year}>{year}</option>
                ))}
              </select>

              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Specialization</option>
                {specializations.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>
          </>

          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Sign Up
          </motion.button>

          <p className="text-sm text-center text-gray-600 mt-3">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Log In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
