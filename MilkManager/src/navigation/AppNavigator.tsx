import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import FarmersScreen from "../screens/FarmersScreen";
import CollectionScreen from "../screens/CollectionScreen";
import ReportsScreen from "../screens/ReportsScreen";
import type { RootTabParamList } from "../types";

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#e5e7eb",
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarActiveTintColor: "#2563eb",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: "डॅशबोर्ड",
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Collection"
          component={CollectionScreen}
          options={{
            tabBarLabel: "संकलन",
            tabBarIcon: ({ focused }) => <TabIcon emoji="🥛" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Farmers"
          component={FarmersScreen}
          options={{
            tabBarLabel: "शेतकरी",
            tabBarIcon: ({ focused }) => <TabIcon emoji="👨‍🌾" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            tabBarLabel: "अहवाल",
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
