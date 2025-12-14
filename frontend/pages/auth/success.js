import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      // 1. Grab the token and username from the URL
      const { token, username } = router.query;

      if (token && username) {
        // 2. Save them to the browser's LocalStorage (Permanent memory)
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        
        // 3. Redirect to the Dashboard
        router.push('/dashboard');
      }
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl font-semibold animate-pulse text-blue-600">
        Logging you in...
      </div>
    </div>
  );
}