import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function GitHubCallback() {
  const router = useRouter();
  // 👇 Uses the Vercel Environment Variable for backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const { code } = router.query;

    if (code) {
      // Send the code to your backend to verify it
      axios.post(`${API_URL}/auth/github`, { code })
        .then(res => {
          // Save the token and redirect to dashboard
          localStorage.setItem('token', res.data.access_token);
          localStorage.setItem('username', res.data.username);
          router.push('/dashboard'); 
        })
        .catch(err => {
            console.error("Login Error:", err);
            alert("Login Failed! Check console for details.");
            router.push('/');
        });
    }
  }, [router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 animate-pulse">
      Verifying GitHub Identity...
    </div>
  );
}