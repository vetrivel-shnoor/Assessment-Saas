import { Link } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

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
        <Link to="/login" className="hidden sm:block text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 transition-colors">
          Log In
        </Link>
        <button className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 dark:bg-emerald-500 rounded-xl hover:bg-black dark:hover:bg-emerald-600 transition-all shadow-md">
          Get Started
        </button>
        <button className="lg:hidden p-2 text-gray-600 dark:text-gray-400">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
