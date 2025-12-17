import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar'; 
import { motion, AnimatePresence } from 'framer-motion'; // <--- ANIMATION ENGINE
import { Trash2, Bell, CheckCircle, XCircle, Briefcase, Crown, Github, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState({ repos: [], requests: [], joined: [], owned: [] });
  const [activeTab, setActiveTab] = useState('work'); // 'work' | 'lead' | 'import'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (!token) { router.push('/'); return; }

    const fetchAll = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [repos, reqs, joined, owned] = await Promise.all([
            axios.get(`https://open-hub-api-1.onrender.com/projects/github/repos?username=${username}`, { headers: { 'access-token': token } }),
            axios.get(`https://open-hub-api-1.onrender.com/projects/requests/pending?username=${username}`, { headers }),
            axios.get(`https://open-hub-api-1.onrender.com/projects/joined?username=${username}`, { headers }),
            axios.get(`https://open-hub-api-1.onrender.com/projects/owned?username=${username}`, { headers })
        ]);
        setData({ repos: repos.data, requests: reqs.data, joined: joined.data, owned: owned.data });
        
        // Auto-switch tab if there are pending requests
        if(reqs.data.length > 0) setActiveTab('lead');
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // --- Handlers (Same Logic) ---
  const handleImport = async (repo) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    try {
        const res = await axios.post(`https://open-hub-api-1.onrender.com/projects/?username=${username}`, repo, { headers: { 'Authorization': `Bearer ${token}` } });
        alert(`✅ Imported ${repo.title}`);
        setData(prev => ({ ...prev, owned: [...prev.owned, res.data] }));
        setActiveTab('lead'); // Switch to lead tab to show new project
    } catch { alert("⚠️ Already imported."); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure?")) return;
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    await axios.delete(`https://open-hub-api-1.onrender.com/projects/${id}?username=${username}`, { headers: { 'Authorization': `Bearer ${token}` } });
    setData(prev => ({ ...prev, owned: prev.owned.filter(p => p.id !== id) }));
  };

  const handleRequest = async (id, status, repoUrl) => {
    await axios.put(`https://open-hub-api-1.onrender.com/projects/requests/${id}`, { status });
    setData(prev => ({ ...prev, requests: prev.requests.filter(r => r.id !== id) }));
    if(status === 'accepted') window.open(`${repoUrl}/settings/access`, '_blank');
  };

  // --- Animation Variants ---
  const tabContentVariant = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 mt-2 font-medium">Manage your code journey.</p>
            </div>
            
            {/* ALERT BADGE */}
            {data.requests.length > 0 && (
                 <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="bg-red-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-red-200"
                 >
                    <Bell size={18} fill="currentColor" />
                    {data.requests.length} Pending Actions
                 </motion.div>
            )}
        </div>

        {/* --- INTERACTIVE TABS --- */}
        <div className="flex gap-4 mb-10 border-b border-gray-200 pb-1">
            {['work', 'lead', 'import'].map((tab) => {
                const isSelected = activeTab === tab;
                const labels = { work: 'My Work', lead: 'My Projects', import: 'Import New' };
                const icons = { work: Briefcase, lead: Crown, import: Github };
                const Icon = icons[tab];

                return (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-4 px-4 flex items-center gap-2 font-bold transition-colors ${
                            isSelected ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Icon size={18} />
                        {labels[tab]}
                        {isSelected && (
                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-lg" />
                        )}
                    </button>
                )
            })}
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <AnimatePresence mode='wait'>
            
            {/* TAB 1: MY WORK (JOINED) */}
            {activeTab === 'work' && (
                <motion.div key="work" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.joined.length === 0 && (
                        <div className="col-span-2 text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
                            <h3 className="text-gray-400 font-bold text-lg">No Active Contributions</h3>
                            <button onClick={() => router.push('/feed')} className="mt-2 text-blue-600 font-bold flex items-center gap-1 justify-center hover:underline">
                                Browse Community <ArrowRight size={16}/>
                            </button>
                        </div>
                    )}
                    {data.joined.map(p => (
                        <motion.div 
                            whileHover={{ y: -5, scale: 1.02 }}
                            key={p.id} 
                            onClick={() => router.push(`/projects/${p.id}`)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer group hover:shadow-xl hover:shadow-blue-100/50 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-100 text-green-700 p-2 rounded-lg"><Briefcase size={20} /></div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase">Contributor</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">{p.title}</h3>
                            <p className="text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* TAB 2: MY PROJECTS (OWNED) & REQUESTS */}
            {activeTab === 'lead' && (
                <motion.div key="lead" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                    
                    {/* REQUESTS SECTION */}
                    {data.requests.length > 0 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                            <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2"><Bell size={18}/> Review Requests</h3>
                            <div className="space-y-3">
                                {data.requests.map(req => (
                                    <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <img src={req.sender_avatar} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <span className="font-bold text-gray-900">{req.sender_username}</span>
                                                <span className="text-gray-500 mx-1">wants to join</span>
                                                <span className="font-bold text-blue-600">{req.project_title}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRequest(req.id, "accepted", req.project_repo_url)} className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold text-sm">Accept</motion.button>
                                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRequest(req.id, "rejected", null)} className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg font-bold text-sm">Reject</motion.button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OWNED PROJECTS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.owned.map(p => (
                            <motion.div 
                                whileHover={{ y: -5 }}
                                key={p.id} 
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group"
                            >
                                <div onClick={() => router.push(`/projects/${p.id}`)} className="cursor-pointer">
                                    <div className="bg-blue-100 text-blue-700 w-10 h-10 flex items-center justify-center rounded-xl mb-4"><Crown size={20} /></div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">{p.title}</h3>
                                    <p className="text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                                </div>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDelete(p.id)}
                                    className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition bg-white p-2 rounded-full shadow-sm border border-gray-100"
                                >
                                    <Trash2 size={18} />
                                </motion.button>
                            </motion.div>
                        ))}
                         {data.owned.length === 0 && (
                            <div className="col-span-2 text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">You don't own any projects yet.</p>
                                <button onClick={() => setActiveTab('import')} className="text-blue-600 font-bold mt-2">Import from GitHub</button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* TAB 3: IMPORT */}
            {activeTab === 'import' && (
                <motion.div key="import" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Github /> GitHub Repositories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {data.repos.map(repo => (
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                key={repo.repo_url} 
                                className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="font-bold text-gray-900 truncate mb-1">{repo.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">{repo.description || "No description."}</p>
                                </div>
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleImport(repo)}
                                    className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-black transition"
                                >
                                    Import Project
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

        </AnimatePresence>
      </div>
    </div>
  );
}