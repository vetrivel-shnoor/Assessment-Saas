import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Shield, Camera, Timer, FileText, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import api from '../services/api';

const OnboardingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser, isValidating } = useApp();
  const navigate = useNavigate();

  const [userType, setUserType] = useState('candidate');
  
  // Basic Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Role-specific Info
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isValidating) {
      if (!user) {
        navigate('/login');
      } else if (user.onboardingCompleted) {
        navigate('/dashboard');
      } else {
        // Pre-fill existing data
        if (user.firstName && user.firstName !== 'User' && user.firstName !== 'Google') setFirstName(user.firstName);
        if (user.lastName && user.lastName !== 'User') setLastName(user.lastName);
        if (user.phone) setPhone(user.phone);
      }
    }
  }, [user, isValidating, navigate]);

  if (isValidating || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = { 
        userType,
        firstName,
        lastName,
        phone
      };
      
      if (userType === 'organisation') {
        payload.companyName = companyName;
        payload.jobTitle = jobTitle;
      } else {
        payload.skills = skills;
        payload.experienceLevel = experienceLevel;
      }

      const res = await api.post('/api/auth/complete-onboarding', payload);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white dark:bg-gray-950 transition-colors duration-500">
      
      {/* Theme Toggle Floating */}
      <div className="absolute top-6 right-8 z-20">
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-gray-500 hover:text-emerald-500 transition-colors rounded-full bg-white dark:bg-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-700"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-emerald-950 text-white p-12 lg:p-16 relative overflow-hidden border-r border-emerald-900">
        <div className="relative z-10">
          <div className="mb-16">
             <Logo linkTo="/" />
          </div>

          <div className="max-w-md">
            <h2 className="text-[2.5rem] font-bold text-white mb-1 leading-tight">Complete your</h2>
            <h2 className="text-[2.5rem] font-bold text-emerald-400 mb-6 leading-tight">profile setup</h2>
            <p className="text-emerald-100/70 text-sm leading-relaxed mb-16 max-w-sm">
              We need a few more details to customize your experience on the platform.
            </p>

            <div className="space-y-8">
              {[
                { icon: Shield, text: "Secure Proctored Exams" },
                { icon: Camera, text: "Live Camera Monitoring" },
                { icon: Timer, text: "Auto-Save & Timer" },
                { icon: FileText, text: "Instant Results & Reports" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-emerald-500/30 group-hover:bg-emerald-500/20 transition-colors flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-emerald-50 tracking-wide">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-16 lg:px-24 bg-white dark:bg-gray-950 overflow-y-auto py-12">
        <div className="w-full max-w-[28rem] mx-auto">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Almost there!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please tell us a bit more about yourself.
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-xl mb-10 border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setUserType('candidate')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                userType === 'candidate' 
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <User className="w-4 h-4" />
              Student / Candidate
            </button>
            <button
              onClick={() => setUserType('organisation')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                userType === 'organisation' 
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Organisation
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium border border-red-100 dark:border-red-800/50">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                  Last Name
                </label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
              />
            </div>

            {userType === 'organisation' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    required={userType === 'organisation'}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="HR Manager"
                    required={userType === 'organisation'}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, Node.js, Python"
                    required={userType === 'candidate'}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    required={userType === 'candidate'}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white outline-none text-sm appearance-none"
                  >
                    <option value="" disabled>Select</option>
                    <option value="beginner">0-2 years</option>
                    <option value="intermediate">3-5 years</option>
                    <option value="expert">5+ years</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 mt-6 text-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
