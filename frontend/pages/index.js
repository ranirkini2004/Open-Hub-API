import { useRouter } from 'next/router';
import { Github } from 'lucide-react'; 

export default function Login() {
  const router = useRouter();
  
  // 👇 This reads the key you added to Vercel Dashboard
  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID; 
  const REDIRECT_URI = "https://open-hub-api.vercel.app/github"; // Change to your actual Vercel domain

  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
        alert("Setup Error: Missing NEXT_PUBLIC_GITHUB_CLIENT_ID in Vercel settings.");
        return;
    }

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;


  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">OpenCollab</h1>
        <p className="text-gray-500 mb-8">Join the Developer Universe</p>

        <button 
          onClick={handleGitHubLogin}
          className="w-full bg-[#24292e] text-white py-4 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-3 text-lg shadow-lg"
        >
          <Github size={24} />
          Login with GitHub
        </button>
      </div>
    </div>
  );
}