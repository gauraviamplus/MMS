import "./src/global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { DataProvider } from "./src/context/DataContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </SafeAreaProvider>
  );
}
