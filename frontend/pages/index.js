import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Use the environment variable for the API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use URLSearchParams for OAuth2 form data
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('password', formData.password);

      const res = await axios.post(`${API_URL}/token`, params);
      
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', formData.username);
      
      alert("✅ Login Successful!");
      router.push('/dashboard'); // Go to Dashboard after login
    } catch (err) {
      alert("❌ Login Failed. Check username/password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-500 text-center mb-8">Sign in to OpenCollab</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Enter your username"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login to Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-gray-500">New here? <span className="text-blue-600 font-bold cursor-pointer">Register (Coming Soon)</span></p>
        </div>
      </div>
    </div>
  );
}