import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Home, LayoutDashboard, User, LogOut, Code2, FolderGit2 } from 'lucide-react';

export default function Layout({ children }) {
  const router = useRouter();

  const menuItems = [
    { name: 'Feed', icon: Home, path: '/feed' },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed w-64 h-full bg-white border-r border-gray-200 shadow-xl z-50 flex flex-col justify-between"
      >
        <div>
            <div className="p-8 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Code2 className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">OpenCollab</h1>
            </div>

            <nav className="px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = router.pathname === item.path;
                    return (
                        <div 
                            key={item.name}
                            onClick={() => router.push(item.path)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                                isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-bold">{item.name}</span>
                        </div>
                    );
                })}
            </nav>
        </div>

        <div className="p-4 border-t">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition font-bold"
            >
                <LogOut className="w-5 h-5" />
                Logout
            </button>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-64 p-10 relative overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Page Content with Entrance Animation */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
      </main>
    </div>
  );
}