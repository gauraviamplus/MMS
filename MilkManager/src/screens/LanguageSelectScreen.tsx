import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { Language } from "../i18n/translations";

const PRIMARY = "#7C3AED";

const LANGS: { code: Language; native: string; sub: string; flag: string }[] = [
  { code: "en", native: "English", sub: "Continue in English",    flag: "🇬🇧" },
  { code: "hi", native: "हिंदी",   sub: "हिंदी में जारी रखें",   flag: "🇮🇳" },
  { code: "mr", native: "मराठी",  sub: "मराठीत पुढे जा",         flag: "🇮🇳" },
];

export default function LanguageSelectScreen() {
  const { setLanguage } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: "#7C3AED" }}>
      {/* Language cards */}
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 32 }}>
        {LANGS.map((lang, i) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              padding: 22,
              marginBottom: i < LANGS.length - 1 ? 14 : 0,
              flexDirection: "row",
              alignItems: "center",
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              borderWidth: 1.5,
              borderColor: "#E5E7EB",
            }}>
            <Text style={{ fontSize: 36, marginRight: 18 }}>{lang.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#1F2937", marginBottom: 3 }}>
                {lang.native}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>{lang.sub}</Text>
            </View>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: PRIMARY, justifyContent: "center", alignItems: "center",
            }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
