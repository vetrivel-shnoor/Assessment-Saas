import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
            <Link
              to="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-red-500 transition-colors w-full text-gray-500 dark:text-gray-400"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Link>
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

            <div className="h-10 w-10 ml-2 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-sm font-bold text-white shadow-sm cursor-pointer">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
