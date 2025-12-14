import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [repos, setRepos] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [joinedProjects, setJoinedProjects] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (!token) { router.push('/'); return; }

    const fetchData = async () => {
      try {
        const repoRes = await axios.get(
          `http://127.0.0.1:8000/projects/github/repos?username=${username}`,
          { headers: { 'access-token': token } }
        );
        setRepos(repoRes.data);

        const reqRes = await axios.get(
          `http://127.0.0.1:8000/projects/requests/pending?username=${username}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setRequests(reqRes.data);

        const joinedRes = await axios.get(
          `http://127.0.0.1:8000/projects/joined?username=${username}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setJoinedProjects(joinedRes.data);

      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const handleImport = async (repo) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    try {
      await axios.post(
        `http://127.0.0.1:8000/projects/?username=${username}`,
        repo, 
        { headers: { 'Authorization': `Bearer ${token}` } } 
      );
      alert(`✅ Imported "${repo.title}" successfully!`);
    } catch (err) {
      alert("⚠️ Error: Project might already be imported.");
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      await axios.put(`http://127.0.0.1:8000/projects/requests/${requestId}`, { status });
      setRequests(requests.filter(r => r.id !== requestId));
      alert(`User ${status}!`);
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Dashboard</h1>
          
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/feed')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition shadow-md"
            >
              Feed 🌎
            </button>
            
            {/* --- NEW PROFILE BUTTON --- */}
            <button 
              onClick={() => router.push('/profile')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
            >
              My Profile 👤
            </button>
            {/* --------------------------- */}

            <button 
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Logout 🚪
            </button>
          </div>
        </div>

        {/* --- SECTION 1: NOTIFICATIONS (INBOX) --- */}
        {requests.length > 0 && (
          <div className="mb-10 bg-white p-6 rounded-xl shadow border-l-4 border-yellow-400">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🔔 Pending Join Requests</h2>
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    {req.sender_avatar && (
                        <img src={req.sender_avatar} alt="avatar" className="w-10 h-10 rounded-full border" />
                    )}
                    <p className="text-gray-700">
                      <span className="font-bold text-black">{req.sender_username}</span> wants to join 
                      <span className="font-bold text-blue-600"> {req.project_title}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequest(req.id, "accepted")}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 text-sm font-semibold transition"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRequest(req.id, "rejected")}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm font-semibold transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SECTION 2: PROJECTS I'VE JOINED --- */}
        {joinedProjects.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🤝 Projects I've Joined</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedProjects.map((project) => (
                <div key={project.id} className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-green-900 mb-2 truncate">{project.title}</h2>
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                      Team Member
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden line-clamp-2">
                    {project.description || "No description."}
                  </p>
                  <div className="mt-2">
                    <a 
                      href={project.repo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-700 font-bold hover:underline text-sm"
                    >
                      View Code →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SECTION 3: MY REPOS (OUTBOX) --- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your GitHub Repositories</h2>

        {loading ? (
          <p className="text-gray-500 text-lg">Loading from GitHub...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <div key={repo.repo_url} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
                <h2 className="text-xl font-bold text-blue-600 mb-2 truncate">{repo.title}</h2>
                <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden line-clamp-2">
                  {repo.description || "No description provided."}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                    {repo.language || "Code"}
                  </span>
                  <button 
                    onClick={() => handleImport(repo)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Import +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}