import "./src/global.css";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { DataProvider }     from "./src/context/DataContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import OtpScreen   from "./src/screens/OtpScreen";

function AuthFlow() {
  const [screen,  setScreen]  = useState<"login" | "otp">("login");
  const [phone,   setPhone]   = useState("");
  const [sentOtp, setSentOtp] = useState("");

  function handleOtpSent(p: string, otp: string) {
    setPhone(p);
    setSentOtp(otp);
    setScreen("otp");
  }

  async function handleResend() {
    setScreen("login");
    setSentOtp("");
  }

  if (screen === "otp") {
    return (
      <OtpScreen
        phone={phone}
        sentOtp={sentOtp}
        onBack={() => setScreen("login")}
        onResend={handleResend}
      />
    );
  }
  return <LoginScreen onOtpSent={handleOtpSent} />;
}

function AppContent() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <AuthFlow />;
  return (
    <DataProvider>
      <AppNavigator />
    </DataProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#7C3AED" />
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
