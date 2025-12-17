import { useRouter } from 'next/router';
import { Users, Layout, LogOut, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/');
  };

  const NavItem = ({ path, icon: Icon, label }) => {
    const isActive = router.pathname === path;
    return (
      <button 
        onClick={() => router.push(path)}
        className={`relative flex items-center gap-2 px-4 py-2 font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
      >
        <Icon size={18} />
        {label}
        {isActive && (
            <motion.div 
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full"
            />
        )}
      </button>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/feed')}>
            <motion.div whileHover={{ rotate: 10 }} className="bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-blue-200">OC</motion.div>
            <span className="font-extrabold text-gray-800 text-xl tracking-tight">OpenCollab</span>
        </div>

        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <NavItem path="/feed" icon={Users} label="Community" />
            <NavItem path="/dashboard" icon={Layout} label="Workspace" />
        </div>

        <div className="flex items-center gap-4">
            <button onClick={() => router.push('/profile')} className="hover:bg-gray-100 p-2 rounded-full transition">
                <UserCircle size={24} className="text-gray-600" />
            </button>
            <button onClick={handleLogout} className="text-red-500 font-bold text-sm hover:bg-red-50 px-3 py-1 rounded-lg transition">
                Logout
            </button>
        </div>
      </div>
    </nav>
  );
}