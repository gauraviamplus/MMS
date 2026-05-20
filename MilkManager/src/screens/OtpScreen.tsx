import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const C = {
  primary:    "#7C3AED",
  bg:         "#F5F3FF",
  card:       "#FFFFFF",
  border:     "#E5E7EB",
  text:       "#1F2937",
  textSub:    "#6B7280",
  gray100:    "#F3F4F6",
  gray400:    "#9CA3AF",
};

interface Props {
  phone: string;
  sentOtp: string;  // dev only
  onBack: () => void;
  onResend: () => void;
}

export default function OtpScreen({ phone, sentOtp, onBack, onResend }: Props) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  async function handleVerify() {
    if (otp.length !== 6) {
      Alert.alert(t("error"), t("invalidOtp"));
      return;
    }
    setLoading(true);
    try {
      await api.auth.verifyOtp(phone, otp);
      login(phone);
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      if (msg.includes("expired"))      Alert.alert(t("error"), t("otpExpired"));
      else if (msg.includes("Invalid")) Alert.alert(t("error"), t("wrongOtp"));
      else                               Alert.alert(t("error"), msg);
      setOtp("");
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
            {/* Back button */}
            <TouchableOpacity onPress={onBack}
              style={{ margin: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" }}>
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>

            {/* Top area */}
            <View style={{ alignItems: "center", paddingTop: 20, paddingBottom: 40 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center",
                marginBottom: 20,
              }}>
                <Text style={{ fontSize: 36 }}>📱</Text>
              </View>
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff" }}>{t("verifyOtp")}</Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center", paddingHorizontal: 32 }}>
                {t("otpSentTo")} +91 {phone}
              </Text>
              {/* Dev helper */}
              {sentOtp ? (
                <View style={{ marginTop: 12, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>
                    OTP: {sentOtp}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Bottom card */}
            <View style={{ backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 48 }}>
              <Text style={{ fontSize: 15, color: C.textSub, marginBottom: 20, textAlign: "center" }}>
                {t("enterOtp")}
              </Text>

              {/* OTP Boxes */}
              <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
                <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 32 }}>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <View key={i} style={{
                      width: 48, height: 58, borderRadius: 14, justifyContent: "center", alignItems: "center",
                      backgroundColor: otp[i] ? C.bg : C.gray100,
                      borderWidth: 2,
                      borderColor: otp.length === i ? C.primary : otp[i] ? C.primary : C.border,
                    }}>
                      <Text style={{ fontSize: 24, fontWeight: "800", color: C.primary }}>
                        {otp[i] ?? ""}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>

              {/* Hidden real input */}
              <TextInput
                ref={inputRef}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                value={otp}
                onChangeText={v => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading || otp.length !== 6}
                style={{
                  backgroundColor: otp.length === 6 ? C.primary : C.gray400,
                  paddingVertical: 16, borderRadius: 16, alignItems: "center",
                  elevation: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 20,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>{t("verifyOtp")}</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={onResend} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: C.primary, fontWeight: "700" }}>{t("resendOtp")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
