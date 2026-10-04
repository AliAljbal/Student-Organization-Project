import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('users/login/', {
        username,
        password,
      });

      const data = response.data;

      if (response.status === 200) {
        // ✅ حفظ التوكنات في localStorage
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh', data.refresh);

        // ✅ التوجيه إلى لوحة التحكم
        navigate('/dashboard');
      } else {
        alert('❌ اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('⚠️ حدث خطأ أثناء محاولة الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 to-indigo-800">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg p-10 rounded-lg max-w-sm w-full space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>

        <div>
          <label className="block text-sm text-gray-600">Username or email</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter your username or email"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition ${loading && 'opacity-50 cursor-not-allowed'}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
