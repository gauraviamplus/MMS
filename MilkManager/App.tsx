import "./src/global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { DataProvider } from "./src/context/DataContext";
import { LanguageProvider } from "./src/context/LanguageContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <LanguageProvider>
        <DataProvider>
          <AppNavigator />
        </DataProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
