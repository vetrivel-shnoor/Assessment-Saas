import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const AppContext = createContext();

/**
 * Given a user object, figure out which onboarding step they should be on.
 * Returns a number (0-indexed step) or null if onboarding is complete.
 *
 * Steps:
 *  0 — choose role type
 *  1 — org: enter org name
 *  2 — org: pick a plan
 */
export const getOnboardingStep = (user) => {
  if (!user || user.onboardingCompleted) return null;
  if (user.role === 'superadmin') return null; // superadmins skip onboarding

  // Candidate — they should be complete immediately after choosing candidate
  // If they are stuck here, send to step 0 to re-choose
  if (user.role === 'candidate') return 0;

  // Organisation — check what's missing
  if (user.role === 'organisation') {
    if (!user.tenantId) {
      // Has org name? → go to plan step; else org info step
      return user.companyName ? 2 : 1;
    }
    return null; // has tenant, onboarding should be complete
  }

  // Default user (just signed up, hasn't chosen role yet)
  return 0;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("app_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/api/auth/config');
        setGoogleAuthEnabled(res.data.googleAuthEnabled);
      } catch (err) {
        console.error("Failed to fetch auth config", err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const result = await api.get('/api/auth/me');
        if (result.data.success) {
          setUser(result.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setUser(null);
        } else {
          console.warn("Network unreachable or backend not responding.");
        }
      }
      setIsValidating(false);
    };

    verifyUser();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("app_user", JSON.stringify(user));
    else localStorage.removeItem("app_user");
  }, [user]);

  return (
    <AppContext.Provider value={{ user, setUser, isValidating, googleAuthEnabled }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
