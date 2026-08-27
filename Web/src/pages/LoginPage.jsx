import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Camera, Timer, FileText, Sun, Moon, Eye, Lock, Mail, User, Phone, LockIcon, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import api from '../services/api';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(1);
  const [userType, setUserType] = useState('candidate');
  
  // Form State
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Dynamic Onboarding Fields
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const { user, setUser, isValidating } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isValidating && user) {
      if (user.onboardingCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, isValidating, navigate]);

  // Check frontend env for Google Auth button visibility
  const hasGoogleAuth = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login API Call
        const res = await api.post('/api/auth/login', { email, password });
        setUser(res.data.user);
        navigate('/onboarding');
      } else {
        // Signup API Call
        const payload = {
          fullname,
          username,
          email,
          password,
          confirmPassword,
          userType
        };
        
        if (userType === 'organisation') {
            payload.companyName = companyName;
            payload.jobTitle = jobTitle;
        } else {
            payload.skills = skills;
            payload.experienceLevel = experienceLevel;
        }

        const res = await api.post('/api/auth/signup', payload);
        setUser(res.data.user);
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isLogin ? 'login' : 'sign up'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`;
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

      {/* Left Side - Info Panel (Full Height Split) */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-emerald-950 text-white p-12 lg:p-16 relative overflow-hidden border-r border-emerald-900">
        <div className="relative z-10">
          <div className="mb-16">
             {/* Unified Logo */}
             <Logo linkTo="/" />
          </div>

          <div className="max-w-md">
            <h2 className="text-[2.5rem] font-bold text-white mb-1 leading-tight">Welcome back to</h2>
            <h2 className="text-[2.5rem] font-bold text-emerald-400 mb-6 leading-tight">your portal</h2>
            <p className="text-emerald-100/70 text-sm leading-relaxed mb-16 max-w-sm">
              Sign in to access your assigned assessments, track your progress, and complete recruitment tests.
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
        
        <div className="relative z-10 pt-10 border-t border-emerald-800 mt-10">
           <p className="text-[0.7rem] text-emerald-200/50 italic">
             "These measures ensure a fair and secure assessment process for all candidates."
           </p>
        </div>
      </div>

      {/* Right Side - Form (Full Height Split) */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-16 lg:px-24 bg-white dark:bg-gray-950 min-h-screen overflow-y-auto py-12">
        <div className="w-full max-w-[28rem] mx-auto">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isLogin ? 'Sign In' : (signupStep === 1 ? 'Choose Account Type' : 'Create Account')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? 'Enter your credentials to continue' : (signupStep === 1 ? 'Select how you want to use the platform' : `Sign up as ${userType === 'candidate' ? 'a Candidate' : 'an Organisation'}`)}
            </p>
          </div>

          {!isLogin && signupStep === 1 ? (
            <div className="space-y-4">
              <button
                onClick={() => { setUserType('candidate'); setSignupStep(2); }}
                className="w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 border-gray-100 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 group bg-white dark:bg-gray-900 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Student / Candidate</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Take assessments and track your progress</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setUserType('organisation'); setSignupStep(2); }}
                className="w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 border-gray-100 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 group bg-white dark:bg-gray-900 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Organisation</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create tests and manage candidates</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium border border-red-100 dark:border-red-800/50">
                  {error}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        placeholder="John Doe"
                        required={!isLogin}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        required={!isLogin}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                      />
                    </div>
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
                          required={!isLogin && userType === 'organisation'}
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
                          required={!isLogin && userType === 'organisation'}
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
                          placeholder="React, Node.js"
                          required={!isLogin && userType === 'candidate'}
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
                          required={!isLogin && userType === 'candidate'}
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
                </>
              )}

              <div>
                <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
                />
              </div>
              
              <div className={!isLogin ? "grid grid-cols-2 gap-4" : ""}>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none pr-12 text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required={!isLogin}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 outline-none pr-12 text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end pt-1">
                  <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 mt-4 text-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>

              {hasGoogleAuth && (
                <div className="mt-5">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white dark:bg-gray-950 text-gray-500">or continue with</span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-8 text-center">
            {(!isLogin && signupStep === 2) ? (
              <button
                type="button"
                onClick={() => setSignupStep(1)}
                className="text-sm text-gray-500 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-3 block w-full"
              >
                ← Back to account type selection
              </button>
            ) : null}
            
            <p className="text-xs text-gray-500 font-medium mb-3">
              {isLogin ? "New candidate?" : "Already have an account?"} 
              <button 
                type="button" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setSignupStep(1);
                  setError('');
                }} 
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1"
              >
                {isLogin ? "Register for examination" : "Sign In here"}
              </button>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[0.65rem] text-gray-400 font-semibold tracking-wide">
              <Lock className="w-3 h-3" />
              Secure, proctored examination environment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
