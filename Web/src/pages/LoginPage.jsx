import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Camera, Timer, FileText, Sun, Moon, Eye, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [userType, setUserType] = useState('candidate');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center font-sans selection:bg-emerald-200 relative overflow-hidden bg-[#F4F7F6] dark:bg-gray-900 transition-colors duration-500 p-4">
      
      {/* Theme Toggle Floating */}
      <div className="absolute top-6 right-8 z-20">
        <button 
          onClick={toggleTheme}
          className="p-3 text-gray-400 hover:text-emerald-500 transition-colors rounded-full bg-white dark:bg-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row relative z-10 transition-colors duration-500">
        
        {/* Left Side - Info */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-emerald-50/50 dark:bg-gray-800/50 p-12 relative overflow-hidden border-r border-gray-100 dark:border-gray-700">
          <div className="relative z-10">
            <div className="mb-16">
              <Logo linkTo="/" />
            </div>

            <div className="max-w-md">
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome to</h2>
              <h2 className="text-4xl font-extrabold text-emerald-500 mb-8 tracking-tight">your portal</h2>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-12">
                Sign in to access your assigned assessments, track your progress, and complete recruitment tests securely.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Shield, text: "Secure Proctored Exams" },
                  { icon: Camera, text: "Live Camera Monitoring" },
                  { icon: Timer, text: "Auto-Save & Timer" },
                  { icon: FileText, text: "Instant Results & Reports" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-16 sm:px-16 bg-white dark:bg-gray-800 transition-colors duration-500">
          <div className="w-full max-w-md mx-auto">
            
            {/* User Type Toggle */}
            <div className="flex p-1.5 bg-[#F4F7F6] dark:bg-gray-900 rounded-2xl mb-12">
              <button
                onClick={() => setUserType('candidate')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  userType === 'candidate' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Student / Candidate
              </button>
              <button
                onClick={() => setUserType('organisation')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  userType === 'organisation' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Organisation
              </button>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Sign In</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Enter your credentials to continue</p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5 ml-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full px-5 py-4 rounded-2xl border-none bg-[#F4F7F6] dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5 ml-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Enter your password"
                    className="w-full px-5 py-4 rounded-2xl border-none bg-[#F4F7F6] dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none pr-12"
                  />
                  <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <a href="#" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors">
                  Forgot password?
                </a>
              </div>

              <Link 
                to="/dashboard"
                className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 mt-6 text-center block"
              >
                Sign In
              </Link>
            </form>

            <div className="mt-12 text-center pt-8">
              <p className="text-sm text-gray-500 font-medium mb-4">
                New candidate? <a href="#" className="text-emerald-600 font-bold hover:underline ml-1">Register here</a>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold bg-[#F4F7F6] dark:bg-gray-900 py-3 rounded-xl">
                <Lock className="w-3.5 h-3.5" />
                Secure, proctored environment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
