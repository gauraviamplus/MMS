import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  phone: string;
  login: (phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phone,      setPhone]      = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function login(p: string) {
    setPhone(p);
    setIsLoggedIn(true);
  }

  function logout() {
    setPhone("");
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, phone, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
