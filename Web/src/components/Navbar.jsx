import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, UserCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useApp();

  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-8 py-5 bg-[#F4F7F6]/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      {/* Logo Section */}
      <Logo linkTo="/" />

      {/* Navigation Links */}
      <div className="hidden lg:flex items-center space-x-1 bg-white/60 dark:bg-gray-800/60 px-2 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <Link to="#" className="px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full transition-colors">Home</Link>
        <Link to="#" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</Link>
        <Link to="#" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</Link>
        <Link to="#" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</Link>
        <Link to="#" className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact</Link>
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
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center shadow-sm border border-emerald-100 dark:border-gray-800">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture}`} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <UserCircle className="w-6 h-6 text-white" />
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

        <button className="lg:hidden p-2 text-gray-600 dark:text-gray-400">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
