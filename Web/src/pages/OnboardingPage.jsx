import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, Check, ChevronRight, ChevronLeft,
  Sun, Moon, Zap, Users, BarChart3, Shield, Globe, Star, ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp, getOnboardingStep } from '../context/AppContext';
import Logo from '../components/Logo';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../components/Card';

/* ─────────────────────────────────────────────
   Step indicator
───────────────────────────────────────────── */
const StepDots = ({ total, current }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i === current
            ? 'w-8 bg-emerald-500'
            : i < current
            ? 'w-4 bg-emerald-400'
            : 'w-4 bg-gray-200 dark:bg-gray-800'
        }`}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   Module icon map
───────────────────────────────────────────── */
const MODULE_ICONS = {
  Assessments: Zap,
  Candidates: Users,
  'Live Interviews': BarChart3,
  'AI Proctoring': Shield,
  Analytics: BarChart3,
  'Custom Branding': Star,
  'SSO & SAML': Globe,
  Settings: Shield,
};

/* ─────────────────────────────────────────────
   Plan badge colours
───────────────────────────────────────────── */
const PLAN_STYLES = {
  Free: {
    badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    ring: 'border-gray-200 dark:border-gray-700',
    active: 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20',
    accent: 'text-gray-700 dark:text-gray-300',
    popular: false,
  },
  Pro: {
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    ring: 'border-emerald-200 dark:border-emerald-800',
    active: 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20',
    accent: 'text-emerald-600 dark:text-emerald-400',
    popular: true,
  },
  Enterprise: {
    badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    ring: 'border-violet-200 dark:border-violet-800',
    active: 'border-violet-500 dark:border-violet-500 ring-2 ring-violet-500/20',
    accent: 'text-violet-600 dark:text-violet-400',
    popular: false,
  },
};

/* ─────────────────────────────────────────────
   Billing Toggle
───────────────────────────────────────────── */
const BillingToggle = ({ billing, setBilling }) => (
  <div className="flex items-center justify-center mb-8">
    <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-full p-1 gap-1">
      <button
        onClick={() => setBilling('monthly')}
        className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          billing === 'monthly'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setBilling('yearly')}
        className={`px-5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
          billing === 'yearly'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Yearly
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Plan Card
───────────────────────────────────────────── */
const PlanCard = ({ plan, selected, billing, onSelect }) => {
  const getStyle = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('enterprise')) return PLAN_STYLES.Enterprise;
    if (n.includes('pro')) return PLAN_STYLES.Pro;
    return PLAN_STYLES.Free;
  };
  const styles = getStyle(plan.name);
  const displayPrice = billing === 'yearly' ? (plan.yearlyPrice ?? plan.price) : plan.price;
  const isSelected = selected === plan.id;

  return (
    <Card
      onClick={() => onSelect(plan.id)}
      className={`relative cursor-pointer transition-all duration-300 flex flex-col gap-4 min-w-[85vw] sm:min-w-[300px] shrink-0
        ${isSelected ? styles.active : `${styles.ring} hover:border-emerald-300 dark:hover:border-emerald-700`}`}
    >
      <CardContent className="p-5 flex flex-col gap-4 flex-1">
        {/* Popular badge */}
        {styles.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="text-[0.65rem] font-bold bg-emerald-500 text-white px-3 py-1 rounded-full shadow">
              MOST POPULAR
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 ${styles.badge}`}>
              {plan.name}
            </span>
            <div className="flex items-end gap-1">
              <span className={`text-2xl font-extrabold ${styles.accent}`}>
                {displayPrice === 0 ? 'Free' : `₹${displayPrice}`}
              </span>
              {displayPrice > 0 && (
                <span className="text-xs text-gray-400 mb-0.5">/mo</span>
              )}
            </div>
            <div className="min-h-[1rem] mt-0.5">
              {billing === 'yearly' && plan.yearlyPrice != null && plan.yearlyPrice > 0 && (
                <p className="text-[0.65rem] text-gray-400 dark:text-gray-500">
                  billed ₹{plan.yearlyPrice * 12}/year
                </p>
              )}
            </div>
          </div>

        {/* Checkmark when selected */}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
          isSelected
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>

      {/* Features (modules) */}
      <ul className="space-y-2 flex-1">
        {plan.features.map((feat, i) => {
          const Icon = MODULE_ICONS[feat.name] || Zap;
          return (
            <li key={i} className="flex items-start gap-2">
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${styles.accent}`} />
              <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{feat.description}</span>
            </li>
          );
        })}
      </ul>

      {/* Limits */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Users', value: plan.maxUsers === -1 || plan.maxUsers >= 9999 ? '∞' : plan.maxUsers },
          { label: 'Assessments', value: plan.maxAssessments === -1 || plan.maxAssessments >= 9999 ? '∞' : plan.maxAssessments },
          { label: 'Candidates', value: plan.maxCandidates === -1 || plan.maxCandidates >= 9999 ? '∞' : plan.maxCandidates },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className={`text-sm font-bold ${styles.accent}`}>{value}</p>
            <p className="text-[0.6rem] text-gray-400 dark:text-gray-500">{label}</p>
          </div>
        ))}
        </div>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────────
   Main OnboardingPage
───────────────────────────────────────────── */
const TOTAL_ORG_STEPS = 3;   // 1: role type, 2: org info, 3: plan
const TOTAL_CAND_STEPS = 1;  // 1: role type only

const OnboardingPage = () => {
  const { theme: themeString, toggleTheme } = useTheme();
  const { user, setUser, isValidating } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [userType, setUserType] = useState('organisation');
  const [step, setStep] = useState(0); // 0 = choose role type

  // Org info
  const [orgName, setOrgName] = useState('');
  const [billing, setBilling] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const plansContainerRef = useRef(null);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* ── Redirect if already onboarded ── */
  useEffect(() => {
    if (!isValidating) {
      if (!user) navigate('/login');
      else {
        const action = searchParams.get('action');
        if (action === 'create-org') {
          // Skip role selection
          setUserType('organisation');
          const stepParam = parseInt(searchParams.get('step'), 10);
          setStep(!isNaN(stepParam) ? stepParam : 1);
        } else if (user.onboardingCompleted) {
          navigate('/dashboard');
        } else {
          // Resume at the right step from URL param or auto-detect
          const stepParam = parseInt(searchParams.get('step'), 10);
          const autoStep = getOnboardingStep(user);
          const initialStep = !isNaN(stepParam) ? stepParam : (autoStep ?? 0);
          setStep(initialStep);

          // Pre-fill userType from existing role
          if (user.role === 'organisation') setUserType('organisation');
          else if (user.role === 'candidate') setUserType('candidate');

          // Pre-fill org name if available
          if (user.companyName) setOrgName(user.companyName);
        }
      }
    }
  }, [user, isValidating, navigate, searchParams]);

  /* ── Fetch plans when org selects plan step ── */
  useEffect(() => {
    if (step === 2 && userType === 'organisation' && plans.length === 0) {
      setPlansLoading(true);
      api.get('/api/tenants/plans')
        .then(res => {
          setPlans(res.data.plans);
          if (res.data.plans.length > 0) setSelectedPlanId(res.data.plans[0].id);
        })
        .catch(() => toast.error('Failed to load plans'))
        .finally(() => setPlansLoading(false));
    }
  }, [step, userType, plans.length]);

  // Map vertical wheel scroll to horizontal scroll
  useEffect(() => {
    const container = plansContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Don't interfere if the user is scrolling horizontally (like with a trackpad)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [step, plans.length]);

  if (isValidating || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  /* ── Submit ── */
  const handleFinish = async () => {
    setError('');
    setIsLoading(true);
    try {
      const action = searchParams.get('action');
      
      if (action === 'create-org') {
        const payload = {
          name: orgName,
          planId: selectedPlanId,
          billingCycle: billing
        };
        await api.post('/api/tenants/create', payload);
        // Refresh user context to get new tenant list and switch
        const res = await api.get('/api/auth/me');
        setUser(res.data.user);
        toast.success('Organisation created! 🎉');
        navigate('/dashboard');
      } else {
        const payload = { userType };
        if (userType === 'organisation') {
          payload.companyName = orgName;
          payload.planId = selectedPlanId;
          payload.billing = billing;
        }
        const res = await api.post('/api/auth/complete-onboarding', payload);
        setUser(res.data.user);
        toast.success('Welcome aboard! 🎉');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = userType === 'organisation' ? TOTAL_ORG_STEPS : TOTAL_CAND_STEPS;

  const canNext = () => {
    if (step === 0) return true; // role type is always chosen
    if (step === 1 && userType === 'organisation') return orgName.trim().length > 0;
    if (step === 2 && userType === 'organisation') return !!selectedPlanId;
    return false;
  };

  const handleNext = () => {
    if (userType === 'candidate') {
      handleFinish();
      return;
    }
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  /* ── Left panel dynamic text ── */
  const leftContent = {
    0: { title: 'Welcome!', sub: 'Let\'s get you set up in under 2 minutes.' },
    1: { title: 'Your Organisation', sub: 'Tell us a bit about where you work.' },
    2: { title: 'Choose a Plan', sub: 'Pick what fits your team best.' },
  };
  const { title, sub } = leftContent[step] || leftContent[0];

  return (
    <div className="min-h-screen flex font-sans bg-white dark:bg-gray-950 transition-colors duration-500">

      {/* Theme Toggle */}
      <div className="fixed top-5 right-6 z-30">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-gray-400 hover:text-emerald-500 transition-colors"
        >
          {themeString === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col w-5/12 bg-emerald-950 text-white p-14 relative overflow-hidden border-r border-emerald-900">
        <div className="relative z-10">
          <Logo linkTo="/" />
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="max-w-xs">
            <div
              key={step}
              className="animate-fade-in"
              style={{ animation: 'fadeSlideUp 0.4s ease both' }}
            >
              <h2 className="text-4xl font-extrabold leading-tight mb-3">
                {title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 0 ? 'text-white' : 'text-emerald-400'}>{word} </span>
                ))}
              </h2>
              <p className="text-emerald-100/60 text-sm leading-relaxed">{sub}</p>
            </div>

            {/* Step progress pills */}
            <div className="mt-12 flex flex-col gap-3">
              {(userType === 'organisation' ? ['Choose role', 'Organisation info', 'Select plan'] : ['Choose role']).map((label, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-bold border-2 transition-all duration-300 ${
                    i < step
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : i === step
                      ? 'border-emerald-400 text-emerald-300'
                      : 'border-emerald-800 text-emerald-700'
                  }`}>
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${i === step ? 'text-white' : 'text-emerald-200/50'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto bg-white dark:bg-gray-950">
        <div className={`w-full mx-auto py-12 ${step === 2 ? 'max-w-none px-0' : 'max-w-xl px-6 sm:px-12'}`}>

          {/* Step dots (mobile progress) */}
          <div className={`lg:hidden ${step === 2 ? 'px-6 sm:px-12' : ''}`}>
            <StepDots total={totalSteps} current={step} />
          </div>

          {/* ══════════════════════════════
              STEP 0 — Choose role type
          ══════════════════════════════ */}
          {step === 0 && (
            <div>
              <div className="mb-8">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Step 1 of {totalSteps}</p>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">How will you use the platform?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">This helps us tailor the experience for you.</p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  {
                    type: 'organisation',
                    icon: Building2,
                    title: 'Organisation / Institute',
                    desc: 'Create assessments, hire candidates, manage your team',
                    color: 'emerald',
                  },
                ].map(({ type, icon: Icon, title: t, desc, color }) => (
                  <button
                    key={type}
                    onClick={() => setUserType(type)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
                      userType === type
                        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        userType === type ? `bg-${color}-500 text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-gray-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">{t}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        userType === type ? `border-${color}-500 bg-${color}-500` : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {userType === type && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Candidate card */}
                <button
                  onClick={() => setUserType('candidate')}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
                    userType === 'candidate'
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      userType === 'candidate' ? 'bg-violet-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-gray-200'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">Student / Candidate</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Take assessments assigned by organisations</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      userType === 'candidate' ? 'border-violet-500 bg-violet-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {userType === 'candidate' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              STEP 1 — Org info
          ══════════════════════════════ */}
          {step === 1 && userType === 'organisation' && (
            <div>
              <div className="mb-8">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Step 2 of {totalSteps}</p>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Name your organisation</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">This is what your team & candidates will see.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                    Organisation / Institute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Corp, IIT Madras, Apex Academy"
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              STEP 2 — Plan selection
          ══════════════════════════════ */}
          {step === 2 && userType === 'organisation' && (
            <div>
              <div className="mb-6 px-6 sm:px-12">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Step 3 of {totalSteps}</p>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Choose your plan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">You can upgrade or downgrade anytime.</p>
              </div>

              <div className="px-6 sm:px-12">
                <BillingToggle billing={billing} setBilling={setBilling} />
              </div>

              {plansLoading ? (
                <div className="flex items-center justify-center py-12 px-6 sm:px-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
              ) : (
                <div 
                  ref={plansContainerRef}
                  className="flex overflow-x-auto gap-4 pb-8 pt-4 px-6 sm:px-12 [&::-webkit-scrollbar]:hidden"
                >
                  {plans.map(plan => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={selectedPlanId}
                      billing={billing}
                      onSelect={setSelectedPlanId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 mx-6 sm:mx-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800/50">
              {error}
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="mt-8 px-6 sm:px-12 flex items-center justify-between gap-3">
            {/* Back */}
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div /> // spacer
            )}

            {/* Next / Finish */}
            <button
              onClick={handleNext}
              disabled={!canNext() || isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  {step === totalSteps - 1 || userType === 'candidate'
                    ? 'Complete Setup'
                    : 'Continue'}
                  {step < totalSteps - 1 && userType === 'organisation'
                    ? <ChevronRight className="w-4 h-4" />
                    : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fade-in keyframe */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingPage;
