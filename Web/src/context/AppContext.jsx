import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AppContext = createContext();

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
          console.warn("Network unreachable or backend not responding. Retrying disabled to prevent spam.");
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
