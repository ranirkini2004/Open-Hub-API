import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar'; // Keep the navigation consistent
import TechBadge from '../components/TechBadge';
import { motion } from 'framer-motion'; // Animation
import { Search, ArrowRight, Star, Users } from 'lucide-react'; // Icons

export default function Feed() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (searchTerm = '') => {
    try {
      // This endpoint returns ALL projects (Universal)
      const res = await axios.get(`https://open-hub-api-1.onrender.com/projects/?search=${searchTerm}`);
      setProjects(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects", err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchProjects(e.target.value);
  };

  const handleJoinRequest = async (e, projectId) => {
    e.stopPropagation(); // Stop clicking the card
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (!token) { alert("Please login first!"); router.push('/'); return; }

    try {
        await axios.post(
            `https://open-hub-api-1.onrender.com/projects/request?username=${username}`,
            { project_id: projectId },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert("✅ Request Sent! The owner will be notified.");
    } catch (err) {
        alert("⚠️ Request already sent or you are the owner.");
    }
  };

  // Animation Config
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* --- HEADER & SEARCH --- */}
        <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4"
            >
                Explore the Universe 🚀
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-gray-500 text-lg mb-8"
            >
                Discover projects, join teams, and build software together.
            </motion.p>
            
            {/* SEARCH BAR */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
                className="relative group"
            >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-blue-500 transition" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search projects by name, language, or stack..." 
                    value={search}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-900 text-lg transition-all"
                />
            </motion.div>
        </div>

        {/* --- UNIVERSAL GRID --- */}
        {loading ? (
            <div className="text-center text-gray-400 py-20">Loading Universe...</div>
        ) : projects.length === 0 ? (
            <div className="text-center py-20">
                <p className="text-xl font-bold text-gray-400">No projects found.</p>
                <button onClick={() => setSearch('')} className="text-blue-600 font-bold mt-2 hover:underline">Clear Search</button>
            </div>
        ) : (
            <motion.div 
                variants={container} initial="hidden" animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {projects.map(project => (
                    <motion.div 
                        key={project.id} 
                        variants={item}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col justify-between h-full group"
                    >
                        {/* CARD TOP */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">{project.title}</h2>
                                <TechBadge language={project.language} />
                            </div>
                            
                            <p className="text-gray-500 mb-6 line-clamp-3 h-[4.5rem] leading-relaxed">
                                {project.description || "No description provided."}
                            </p>

                            {/* Owner Info */}
                            <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                                <img src={project.owner.avatar_url} className="w-8 h-8 rounded-full ring-2 ring-gray-50" />
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Lead</p>
                                    <p className="text-sm font-bold text-gray-700">{project.owner.username}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                                    <Star size={12} fill="currentColor" />
                                    <span className="text-xs font-bold text-yellow-700">{project.stars}</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD BOTTOM (Action) */}
                        <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex gap-3">
                            <button 
                                onClick={(e) => handleJoinRequest(e, project.id)}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <Users size={16} /> Join Team
                            </button>
                            <button 
                                className="bg-gray-900 text-white p-2 rounded-xl hover:bg-black transition"
                                title="View Details"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        )}
      </div>
    </div>
  );
}