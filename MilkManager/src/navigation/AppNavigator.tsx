import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, ClipboardList, TrendingUp, Calendar, BarChart3, Beef } from "lucide-react-native";
import { useLanguage } from "../context/LanguageContext";

import DashboardScreen  from "../screens/DashboardScreen";
import DailyEntryScreen from "../screens/DailyEntryScreen";
import WeeklyScreen     from "../screens/WeeklyScreen";
import MonthlyScreen    from "../screens/MonthlyScreen";
import YearlyScreen     from "../screens/YearlyScreen";
import AnimalsScreen    from "../screens/AnimalsScreen";

const Tab = createBottomTabNavigator();
const PRIMARY  = "#7C3AED";
const INACTIVE = "#9CA3AF";

export default function AppNavigator() {
  const { t } = useLanguage();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: PRIMARY,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            paddingBottom: Platform.OS === "ios" ? 20 : 6,
            paddingTop: 6,
            height: Platform.OS === "ios" ? 84 : 60,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 1 },
        }}
      >
        <Tab.Screen name="Dashboard"  component={DashboardScreen}
          options={{ tabBarLabel: t("tabHome"),    tabBarIcon: ({ color, size }) => <Home         color={color} size={size - 2} /> }} />
        <Tab.Screen name="DailyEntry" component={DailyEntryScreen}
          options={{ tabBarLabel: t("tabEntries"), tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size - 2} /> }} />
        <Tab.Screen name="Weekly"     component={WeeklyScreen}
          options={{ tabBarLabel: t("tabWeekly"),  tabBarIcon: ({ color, size }) => <TrendingUp   color={color} size={size - 2} /> }} />
        <Tab.Screen name="Monthly"    component={MonthlyScreen}
          options={{ tabBarLabel: t("tabMonthly"), tabBarIcon: ({ color, size }) => <Calendar     color={color} size={size - 2} /> }} />
        <Tab.Screen name="Yearly"     component={YearlyScreen}
          options={{ tabBarLabel: t("tabYearly"),  tabBarIcon: ({ color, size }) => <BarChart3    color={color} size={size - 2} /> }} />
        <Tab.Screen name="Animals"    component={AnimalsScreen}
          options={{ tabBarLabel: t("tabAnimals"), tabBarIcon: ({ color, size }) => <Beef         color={color} size={size - 2} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
