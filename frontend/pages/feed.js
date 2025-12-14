import { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Feed() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // 1. Fetch Projects
  const fetchProjects = async (searchTerm = '') => {
    try {
      const url = searchTerm 
        ? `http://127.0.0.1:8000/projects/?search=${searchTerm}`
        : 'http://127.0.0.1:8000/projects/';
      
      const res = await axios.get(url);
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Handle Search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchProjects(value);
  };

  // 3. Handle Join Request
  const handleJoinRequest = async (projectId) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token) {
        alert("Please login first!");
        return;
    }

    try {
        await axios.post(
            `http://127.0.0.1:8000/projects/request?username=${username}`,
            { project_id: projectId },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert("✅ Request sent! The owner will be notified.");
    } catch (err) {
        console.error(err);
        alert("⚠️ You might have already requested to join this project.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head>
        <title>Community Feed - Open Collab</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Community Projects</h1>
          
          <div className="relative w-full md:w-1/2">
            <input 
              type="text" 
              placeholder="Search by name or language (e.g. 'Python')..." 
              value={search}
              onChange={handleSearch}
              className="w-full p-3 pl-4 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <span className="absolute right-4 top-3 text-gray-400">🔍</span>
          </div>

          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            My Dashboard
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
              
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{project.title}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                  ★ {project.stars}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 h-16 overflow-hidden line-clamp-3">
                {project.description || "No description provided."}
              </p>
              
              {/* Language & Link */}
              <div className="border-t pt-4 flex justify-between items-center mb-4">
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">
                  {project.language || "General"}
                </span>
                
                <a 
                  href={project.repo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  Code ↗
                </a>
              </div>

              {/* --- NEW BUTTON ADDED HERE --- */}
              <button 
                  onClick={() => handleJoinRequest(project.id)}
                  className="w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                  Ask to Join Team 🤝
              </button>
              {/* ----------------------------- */}

            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-3 text-center text-gray-500 py-20 bg-white rounded-xl border border-dashed">
              <p className="text-xl font-semibold">No projects match "{search}"</p>
              <p>Try searching for something else!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}