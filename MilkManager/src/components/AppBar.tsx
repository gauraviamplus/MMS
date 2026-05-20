import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";

const PURPLE  = "#7C3AED";
const GRAY500 = "#6B7280";
const BORDER  = "#E5E7EB";
const WHITE   = "#FFFFFF";
const GRAY900 = "#111827";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS: { key: keyof RootStackParamList; label: string; icon: string }[] = [
  { key: "Dashboard",  label: "Dashboard",   icon: "🏠" },
  { key: "DailyEntry", label: "Daily Entry",  icon: "📋" },
  { key: "Weekly",     label: "Weekly",       icon: "📈" },
  { key: "Monthly",    label: "Monthly",      icon: "📅" },
  { key: "Yearly",     label: "Yearly",       icon: "📆" },
  { key: "Animals",    label: "Animals",      icon: "🐄" },
];

interface AppBarProps {
  activeTab: keyof RootStackParamList;
}

export default function AppBar({ activeTab }: AppBarProps) {
  const navigation = useNavigation<Nav>();

  return (
    <View>
      {/* ── Logo Row ── */}
      <View style={{
        backgroundColor: WHITE,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>🥛</Text>
        <Text style={{ fontSize: 17, fontWeight: "700", color: GRAY900 }}>
          Milk Manager
        </Text>
      </View>

      {/* ── Tab Strip ── */}
      <View style={{ backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          {TABS.map((tab, i) => {
            const active = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  if (tab.key !== activeTab) {
                    navigation.navigate(tab.key as any);
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active ? PURPLE : "transparent",
                  marginRight: i < TABS.length - 1 ? 6 : 0,
                }}
              >
                <Text style={{ fontSize: 13, marginRight: 4 }}>{tab.icon}</Text>
                <Text style={{
                  fontSize: 13,
                  fontWeight: active ? "600" : "400",
                  color: active ? WHITE : GRAY500,
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
