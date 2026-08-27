import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileSignature, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  UserCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import Modal from '../components/layout/Modal';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blobLoaded, setBlobLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useApp();

  const profileSrc = (user?.profilePicture?.startsWith('http') || user?.profilePicture?.startsWith('blob:'))
    ? user.profilePicture 
    : user?.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture}` : null;
  const isDirectUrl = profileSrc?.startsWith('http') || profileSrc?.startsWith('blob:');

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImgError(false);
    if (!isDirectUrl) setBlobLoaded(false);
  }, [profileSrc, isDirectUrl]);

  useEffect(() => {
    const handleStart = () => setIsUploading(true);
    const handleEnd = () => setIsUploading(false);
    window.addEventListener("profile-upload-start", handleStart);
    window.addEventListener("profile-upload-end", handleEnd);
    return () => {
      window.removeEventListener("profile-upload-start", handleStart);
      window.removeEventListener("profile-upload-end", handleEnd);
    };
  }, []);
  
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await api.get('/api/auth/logout');
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
    { name: 'Assessments', href: '/dashboard/assessments', icon: FileSignature },
    { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex font-sans text-gray-900 dark:text-gray-100 selection:bg-emerald-200">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 transition-transform duration-300 lg:translate-x-0 lg:static lg:block shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none border-r border-gray-100 dark:border-gray-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-20 flex items-center px-6">
            <Logo linkTo="/" />
            <button 
              className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 mb-4 mx-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-red-500 transition-colors w-full text-gray-500 dark:text-gray-400 text-left"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 bg-transparent sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:flex items-center bg-white dark:bg-gray-800/50 rounded-full px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] focus-within:ring-2 focus-within:ring-emerald-500/30 dark:focus-within:ring-emerald-500/40 focus-within:shadow-[0_4px_20px_rgba(16,185,129,0.15)] dark:focus-within:shadow-[0_4px_20px_rgba(16,185,129,0.25)] border border-transparent dark:border-gray-700 transition-all duration-300">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm ml-3 w-64 placeholder-gray-400 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-gray-400 hover:text-emerald-500 transition-colors rounded-full bg-white dark:bg-gray-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button className="relative p-2.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full bg-white dark:bg-gray-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-900"></span>
            </button>

            <Link to="/dashboard/profile" className="relative h-10 w-10 ml-2 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-sm font-bold text-white shadow-sm cursor-pointer border border-emerald-100 dark:border-gray-800">
              {(isUploading || (!isDirectUrl && !blobLoaded && !imgError && profileSrc)) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-200/20 dark:bg-white/10 backdrop-blur-md animate-pulse" />
              )}
              {profileSrc && !imgError ? (
                <img 
                  key={profileSrc}
                  src={profileSrc} 
                  alt="Profile" 
                  referrerPolicy="no-referrer" 
                  className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${!isUploading && (isDirectUrl || blobLoaded) ? "opacity-100" : "opacity-0"}`} 
                  onLoad={() => setBlobLoaded(true)}
                  onError={() => { setImgError(true); setBlobLoaded(true); }}
                />
              ) : (
                <UserCircle className="w-6 h-6 text-white z-0 relative" />
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pt-0">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        theme={theme}
      >
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            style={{ color: theme === 'dark' ? '#fff' : '#111' }}
          >
            Cancel
          </button>
          <button
            onClick={handleLogoutConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardLayout;
