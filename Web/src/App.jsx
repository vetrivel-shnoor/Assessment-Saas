import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/assessments" element={<AssessmentsPage />} />
            <Route path="/dashboard/candidates" element={<CandidatesPage />} />
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route path="/dashboard/roles" element={<RolesPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
