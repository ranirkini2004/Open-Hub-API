import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import TechBadge from '../../components/TechBadge'; // <--- Imported correctly

export default function ProjectDetails() {
  const router = useRouter();
  const { id } = router.query; 
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios.get(`https://open-hub-api-1.onrender.com/projects/${id}`)
      .then(res => {
        setProject(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading || !project) return <div className="p-10 text-center text-gray-500">Loading Project Details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10 flex justify-center">
      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
        
        {/* Back Button */}
        <button 
            onClick={() => router.back()}
            className="absolute top-8 left-8 text-gray-400 hover:text-gray-800 font-bold transition"
        >
            ← Back
        </button>

        {/* HEADER SECTION */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{project.title}</h1>
            <div className="flex gap-2 items-center">
                
                {/* --- TECH BADGE COMPONENT --- */}
                <TechBadge language={project.language} />
                {/* ---------------------------- */}
                
                <a href={project.repo_url} target="_blank" className="text-gray-500 hover:text-black flex items-center gap-1 text-sm font-bold border border-gray-300 px-3 py-1 rounded-full transition">
                    GitHub ↗
                </a>
            </div>
          </div>

          {/* Star Count */}
          <div className="text-center bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
             <div className="text-3xl font-bold text-yellow-600">★ {project.stars}</div>
             <div className="text-yellow-700 text-xs uppercase font-bold tracking-wider">GitHub Stars</div>
          </div>
        </div>

        {/* OWNER CARD */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 mb-10 flex items-center justify-between">
            <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => router.push(`/profile?view_user=${project.owner.username}`)}
            >
                <img src={project.owner.avatar_url} className="w-14 h-14 rounded-full border-4 border-white shadow-sm"/>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Project Lead</p>
                    <p className="text-xl font-bold text-gray-800 hover:underline">
                        {project.owner.username}
                    </p>
                </div>
            </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">About the Project</h2>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
            {project.description || "No description provided."}
          </p>
        </div>

        {/* TEAM MEMBERS SECTION */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                The Team <span className="text-gray-400 text-lg font-normal">({project.team.length})</span>
            </h2>
            
            {project.team.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 italic mb-2">No other members yet.</p>
                    <p className="text-blue-600 font-bold text-sm">Be the first to join!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.team.map(member => (
                        <div 
                            key={member.username}
                            onClick={() => router.push(`/profile?view_user=${member.username}`)}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition cursor-pointer bg-white group"
                        >
                            <img src={member.avatar_url} className="w-12 h-12 rounded-full border group-hover:border-blue-400 transition"/>
                            <div>
                                <span className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">{member.username}</span>
                                <p className="text-xs text-gray-400 font-bold uppercase">Contributor</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}