import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../api/client";

const C = {
  primary:    "#7C3AED",
  primaryDark:"#5B21B6",
  bg:         "#F5F3FF",
  card:       "#FFFFFF",
  border:     "#E5E7EB",
  text:       "#1F2937",
  textSub:    "#6B7280",
  gray400:    "#9CA3AF",
};

interface Props {
  onOtpSent: (phone: string, otp: string) => void;
}

export default function LoginScreen({ onOtpSent }: Props) {
  const { t } = useLanguage();
  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      Alert.alert(t("error"), t("invalidPhone"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.sendOtp(cleaned);
      onOtpSent(cleaned, res.otp);
    } catch (e: any) {
      Alert.alert(t("error"), e?.message ?? t("errorSaveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.primary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {/* Top illustration area */}
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, paddingBottom: 40 }}>
              <View style={{
                width: 96, height: 96, borderRadius: 48,
                backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center",
                marginBottom: 24,
              }}>
                <Text style={{ fontSize: 48 }}>🥛</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 }}>
                {t("loginWelcome")}
              </Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#fff", marginTop: 4 }}>
                Milk Manager
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center", paddingHorizontal: 32 }}>
                {t("loginSubtitle")}
              </Text>
            </View>

            {/* Bottom card */}
            <View style={{
              backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
              padding: 32, paddingBottom: 48,
            }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 6 }}>
                {t("phoneLabel")}
              </Text>
              <Text style={{ fontSize: 14, color: C.textSub, marginBottom: 24 }}>
                {t("loginSubtitle")}
              </Text>

              {/* Phone input */}
              <View style={{
                flexDirection: "row", alignItems: "center",
                borderWidth: 2, borderColor: C.border, borderRadius: 16,
                backgroundColor: "#FAFAFA", marginBottom: 24, overflow: "hidden",
              }}>
                <View style={{
                  backgroundColor: C.bg, paddingHorizontal: 14, paddingVertical: 16,
                  borderRightWidth: 1, borderRightColor: C.border,
                }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: C.primary }}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={{ flex: 1, fontSize: 18, fontWeight: "700", color: C.text, paddingHorizontal: 14, paddingVertical: 14 }}
                  value={phone}
                  onChangeText={t => setPhone(t.replace(/\D/g, "").slice(0, 10))}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder={t("phonePlaceholder")}
                  placeholderTextColor={C.gray400}
                />
              </View>

              <TouchableOpacity
                onPress={handleSend}
                disabled={loading || phone.replace(/\D/g, "").length !== 10}
                style={{
                  backgroundColor: phone.replace(/\D/g, "").length === 10 ? C.primary : C.gray400,
                  paddingVertical: 16, borderRadius: 16, alignItems: "center",
                  elevation: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 8,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.5 }}>{t("sendOtp")}</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
