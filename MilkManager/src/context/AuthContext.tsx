import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isLoggedIn: boolean;
  phone: string;
  token: string;
  login: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phone,      setPhone]      = useState("");
  const [token,      setToken]      = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("auth_token"),
      AsyncStorage.getItem("auth_phone"),
    ]).then(([t, p]) => {
      if (t && p) { setToken(t); setPhone(p); setIsLoggedIn(true); }
    });
  }, []);

  async function login(p: string, t: string) {
    await AsyncStorage.setItem("auth_token", t);
    await AsyncStorage.setItem("auth_phone", p);
    setPhone(p); setToken(t); setIsLoggedIn(true);
  }

  async function logout() {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("auth_phone");
    setPhone(""); setToken(""); setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, phone, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
