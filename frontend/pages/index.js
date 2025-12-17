import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  // --- NEW: Check for existing session ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // If a token exists, the user is already logged in. 
    // Send them straight to the dashboard.
    if (token) {
      router.push('/dashboard');
    }
  }, []);
  // ---------------------------------------

  const handleLogin = () => {
    window.location.href = 'https://open-hub-api-1.onrender.com/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <Head>
        <title>Open Collab Hub</title>
      </Head>

      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-6">Open Collab Hub</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Connect with developers in your college. <br/>
          Find teammates, share projects, and build your resume.
        </p>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-gray-900 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-1"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
}