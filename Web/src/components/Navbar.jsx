import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, UserCircle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useApp();
  
  const [blobLoaded, setBlobLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-8 py-5 bg-[#F4F7F6]/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      {/* Logo Section */}
      <Logo linkTo="/" />

      {/* Navigation Links */}
      <div className="hidden lg:flex items-center space-x-1 bg-white/60 dark:bg-gray-800/60 px-2 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <Link to="#home" className="px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full transition-colors">Home</Link>
        <Link to="#how-it-works" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</Link>
        <Link to="#features" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</Link>
        <Link to="#about" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</Link>
        <Link to="#contact" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact</Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-gray-400 dark:text-gray-400 hover:text-emerald-500 transition-colors rounded-full bg-white dark:bg-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {user ? (
          <Link to="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center shadow-sm border border-emerald-100 dark:border-gray-800">
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
                <UserCircle className="w-6 h-6 text-white relative z-0" />
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {user.fullname || user.firstName || "User"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Go to Profile
              </span>
            </div>
          </Link>
        ) : (
          <>
            <Link to="/login" className="hidden sm:block text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 transition-colors">
              Log In
            </Link>
            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 dark:bg-emerald-500 rounded-xl hover:bg-black dark:hover:bg-emerald-600 transition-all shadow-md">
              Get Started
            </Link>
          </>
        )}

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800 py-4 flex flex-col px-4 gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <Link to="#home" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">Home</Link>
          <Link to="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">How It Works</Link>
          <Link to="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">Features</Link>
          <Link to="#about" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">About</Link>
          <Link to="#contact" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">Contact</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
