import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Profile() {
  const router = useRouter();
  const { view_user } = router.query; // Get username from URL if present

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false); // Track if we own this profile
  
  // Form States
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [discord, setDiscord] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    const loggedInUser = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    if (!token) { router.push('/'); return; }

    // Logic: If view_user exists, view them. Otherwise view loggedInUser.
    const targetUsername = view_user || loggedInUser;
    setIsOwnProfile(targetUsername === loggedInUser);

    axios.get(`http://127.0.0.1:8000/users/${targetUsername}`)
      .then(res => {
        setUser(res.data);
        setBio(res.data.bio || '');
        setSkills(res.data.skills || '');
        setLinkedin(res.data.linkedin || '');
        setFullName(res.data.full_name || '');
        setDept(res.data.department || '');
        setYear(res.data.year || '1st Year');
        setDiscord(res.data.discord_handle || '');
      })
      .catch(err => console.error(err));
  }, [router.isReady, view_user]);

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    try {
      await axios.put(
        `http://127.0.0.1:8000/users/profile/me?username=${username}`,
        { 
          bio, 
          skills, 
          linkedin,
          full_name: fullName,
          department: dept,
          year: year,
          discord_handle: discord
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert("✅ Profile Updated!");
      setIsEditing(false);
      setUser({ ...user, bio, skills, linkedin, full_name: fullName, department: dept, year: year, discord_handle: discord });
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (!user) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10 flex flex-col items-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg border border-gray-100">
        
        {/* Header: Avatar & Name */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src={user.avatar_url} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-purple-100 shadow-sm mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            {user.full_name || user.username}
          </h1>
          <p className="text-gray-500 text-sm">@{user.username}</p>
          
          {(user.department || user.year) && (
            <div className="mt-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {user.department || "Student"} • {user.year || "N/A"}
            </div>
          )}
        </div>

        {/* VIEW MODE */}
        {!isEditing ? (
          <div className="space-y-6">
            
            {/* Contact Info (LinkedIn & Discord) */}
            <div className="flex gap-4 justify-center flex-wrap">
                {user.linkedin && (
                    <a href={user.linkedin} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline font-bold bg-blue-50 px-4 py-2 rounded-lg text-sm">
                        🔗 LinkedIn
                    </a>
                )}
                {user.discord_handle && (
                    <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm" 
                         onClick={() => {navigator.clipboard.writeText(user.discord_handle); alert(`Copied Discord ID: ${user.discord_handle}`)}}>
                        💬 {user.discord_handle}
                    </div>
                )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">About Me</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {user.bio || "No bio yet."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills ? (
                  user.skills.split(',').map((skill, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No skills listed.</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {/* Only show Edit button if it is YOUR profile */}
              {isOwnProfile && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition"
                >
                    Edit Profile ✏️
                </button>
              )}
              
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* EDIT MODE (Only accessible if isOwnProfile is true) */
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                    <input 
                        type="text" 
                        value={dept} 
                        onChange={(e) => setDept(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                        placeholder="CSE, ISE..."
                    />
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Year of Study</label>
                    <select 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduated">Graduated</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Discord Username</label>
                <input 
                    type="text" 
                    value={discord} 
                    onChange={(e) => setDiscord(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                    placeholder="username#1234 or username"
                />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                placeholder="Tell us about yourself..."
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Skills (comma separated)</label>
              <input 
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                placeholder="Python, React, AWS..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn URL</label>
              <input 
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleUpdate}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Save Changes 💾
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold hover:bg-red-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}