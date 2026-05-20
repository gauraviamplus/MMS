import "./src/global.css";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { DataProvider }     from "./src/context/DataContext";
import { LanguageProvider, useLanguage } from "./src/context/LanguageContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen          from "./src/screens/LoginScreen";
import OtpScreen            from "./src/screens/OtpScreen";
import LanguageSelectScreen from "./src/screens/LanguageSelectScreen";

function AuthFlow() {
  const [screen, setScreen] = useState<"login" | "otp">("login");
  const [phone,  setPhone]  = useState("");

  function handleOtpSent(p: string) {
    setPhone(p);
    setScreen("otp");
  }

  if (screen === "otp") {
    return (
      <OtpScreen
        phone={phone}
        onBack={() => setScreen("login")}
        onResend={() => setScreen("login")}
      />
    );
  }
  return <LoginScreen onOtpSent={handleOtpSent} />;
}

function AppContent() {
  const { isLoggedIn } = useAuth();
  const { isLanguageSelected, langLoaded } = useLanguage();

  if (!langLoaded) return null;
  if (!isLoggedIn) return <AuthFlow />;
  if (!isLanguageSelected) return <LanguageSelectScreen />;

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
