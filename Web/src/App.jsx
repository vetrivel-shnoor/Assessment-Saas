import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import AssessmentsPage from './pages/AssessmentsPage';
import CandidatesPage from './pages/CandidatesPage';
import SettingsPage from './pages/SettingsPage';
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/UsersPage';
import DashboardLayout from './layouts/DashboardLayout';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';

const DashboardRedirect = () => {
  const { user, isValidating } = useApp();
  if (isValidating) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  let scope = '';
  const role = user.role?.toUpperCase();
  if (role === 'SUPERADMIN' || role === 'ADMIN') {
    scope = 'admin';
  } else if (role === 'ORGANISATION') {
    scope = 'org';
  }
  
  return <Navigate to={scope ? `/dashboard/${scope}` : '/dashboard/home'} replace />;
};

const dashboardRoutes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="home" element={<Dashboard />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="assessments" element={<AssessmentsPage />} />
    <Route path="candidates" element={<CandidatesPage />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="roles" element={<RolesPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </>
);

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardRedirect />} />
              {dashboardRoutes}
              <Route path="admin">{dashboardRoutes}</Route>
              <Route path="org">{dashboardRoutes}</Route>
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
