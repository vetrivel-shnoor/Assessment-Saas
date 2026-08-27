import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
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
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
