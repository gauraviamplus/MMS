import React, { useMemo } from "react";
import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../i18n/translations";

const C = {
  primary:     "#7C3AED",
  primaryDark: "#5B21B6",
  bg:          "#F5F3FF",
  card:        "#FFFFFF",
  border:      "#E5E7EB",
  text:        "#1F2937",
  textSub:     "#6B7280",
  green:       "#10B981",
  red:         "#EF4444",
  cow:         "#7C3AED",
  buffalo:     "#4F46E5",
};

const TODAY     = new Date().toISOString().split("T")[0];
const YESTERDAY = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
const TODAY_LABEL = new Date().toLocaleDateString("en-IN", {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
});

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

export default function DashboardScreen() {
  const { entries, loading } = useData();
  const { t, language, setLanguage } = useLanguage();

  const stats = useMemo(() => {
    const sumCow = (d: string) => entries.filter(e => e.date === d && e.animalType === "cow").reduce((s, e) => s + e.quantity, 0);
    const sumBuf = (d: string) => entries.filter(e => e.date === d && e.animalType === "buffalo").reduce((s, e) => s + e.quantity, 0);
    const tCow = sumCow(TODAY), tBuf = sumBuf(TODAY), tTotal = tCow + tBuf;
    const yCow = sumCow(YESTERDAY), yBuf = sumBuf(YESTERDAY), yTotal = yCow + yBuf;
    return { tCow, tBuf, tTotal, yCow, yBuf, yTotal,
      cowDiff: tCow - yCow, bufDiff: tBuf - yBuf, totalDiff: tTotal - yTotal };
  }, [entries]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.primary, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const dc = (d: number) => d >= 0 ? C.green : C.red;
  const ds = (d: number) => d >= 0 ? "▲" : "▼";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* ── Purple Header ── */}
      <SafeAreaView style={{ backgroundColor: C.bg }} edges={["top"]}>
        <View style={{
          backgroundColor: C.primary, borderRadius: 24, marginHorizontal: 12, marginTop: 8,
          overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4,
          elevation: 8, shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
        }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 2, letterSpacing: 0.4 }}>
            {TODAY_LABEL}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5 }}>
            🥛 {t("milkManager")}
          </Text>
          <View style={{ marginTop: 18 }}>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{t("todaysTotalProduction")}</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
              <Text style={{ fontSize: 52, fontWeight: "800", color: "#fff", letterSpacing: -2, lineHeight: 58 }}>
                {stats.tTotal.toFixed(1)}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: "500", color: "rgba(255,255,255,0.8)", marginBottom: 8, marginLeft: 4 }}>L</Text>
            </View>
            <Text style={{ fontSize: 12, color: dc(stats.totalDiff), backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4, overflow: "hidden" }}>
              {ds(stats.totalDiff)} {Math.abs(stats.totalDiff).toFixed(1)}L {t("fromYesterday")}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* ── Floating Stat Cards ── */}
        <View style={{ flexDirection: "row", marginTop: 12, paddingHorizontal: 16, gap: 10 }}>
          <View style={[styles.floatCard, { flex: 1, borderTopWidth: 3, borderTopColor: C.cow }]}>
            <Text style={styles.floatLabel}>🐄 {t("cowMilk")}</Text>
            <Text style={styles.floatVal}>{stats.tCow.toFixed(1)}<Text style={styles.floatUnit}> L</Text></Text>
            <Text style={[styles.floatDiff, { color: dc(stats.cowDiff) }]}>
              {ds(stats.cowDiff)} {Math.abs(stats.cowDiff).toFixed(1)}L
            </Text>
          </View>
          <View style={[styles.floatCard, { flex: 1, borderTopWidth: 3, borderTopColor: C.buffalo }]}>
            <Text style={styles.floatLabel}>🐃 {t("buffaloMilk")}</Text>
            <Text style={styles.floatVal}>{stats.tBuf.toFixed(1)}<Text style={styles.floatUnit}> L</Text></Text>
            <Text style={[styles.floatDiff, { color: dc(stats.bufDiff) }]}>
              {ds(stats.bufDiff)} {Math.abs(stats.bufDiff).toFixed(1)}L
            </Text>
          </View>
        </View>

        {/* ── Yesterday Summary ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={styles.sectionTitle}>{t("yesterdaysSummary")}</Text>
          <View style={[styles.card, { flexDirection: "row" }]}>
            <YesterdayCol label={t("cow")}     value={stats.yCow}   diff={stats.cowDiff}   color={C.cow}     />
            <View style={{ width: 1, backgroundColor: C.border, marginVertical: 8 }} />
            <YesterdayCol label={t("buffalo")} value={stats.yBuf}   diff={stats.bufDiff}   color={C.buffalo} />
            <View style={{ width: 1, backgroundColor: C.border, marginVertical: 8 }} />
            <YesterdayCol label={t("total")}   value={stats.yTotal} diff={stats.totalDiff} color={C.primary} />
          </View>
        </View>

        {/* ── Quick Stats ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={styles.sectionTitle}>{t("quickInsights")}</Text>
          <View style={[styles.card, { gap: 0 }]}>
            <InsightRow icon="🐄" label={t("cowShareToday")}
              value={stats.tTotal > 0 ? `${((stats.tCow / stats.tTotal) * 100).toFixed(0)}%` : "—"} />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <InsightRow icon="🐃" label={t("buffaloShareToday")}
              value={stats.tTotal > 0 ? `${((stats.tBuf / stats.tTotal) * 100).toFixed(0)}%` : "—"} />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <InsightRow icon="📊" label={t("vsYesterdayTotal")}
              value={stats.yTotal > 0 ? `${(((stats.tTotal - stats.yTotal) / stats.yTotal) * 100).toFixed(1)}%` : "—"}
              valueColor={dc(stats.totalDiff)} />
          </View>
        </View>

        {/* ── Language Selector ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={styles.sectionTitle}>{t("language").toUpperCase()}</Text>
          <View style={[styles.card, { flexDirection: "row", padding: 4, gap: 4 }]}>
            {LANGS.map(({ code, label }) => (
              <TouchableOpacity
                key={code}
                onPress={() => setLanguage(code)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                  backgroundColor: language === code ? C.primary : "transparent",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: language === code ? "#fff" : C.textSub }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function YesterdayCol({ label, value, diff, color }: { label: string; value: number; diff: number; color: string }) {
  const { t } = useLanguage();
  const pos = diff >= 0;
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 16 }}>
      <View style={{ width: 32, height: 4, backgroundColor: color, borderRadius: 2, marginBottom: 10 }} />
      <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>{label} ({t("yesterday")})</Text>
      <Text style={{ fontSize: 20, fontWeight: "800", color: "#1F2937" }}>{value.toFixed(1)}L</Text>
      <Text style={{ fontSize: 11, color: pos ? "#10B981" : "#EF4444", marginTop: 4, fontWeight: "600" }}>
        {pos ? "+" : ""}{diff.toFixed(1)}L {t("today")}
      </Text>
    </View>
  );
}

function InsightRow({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
        <Text style={{ fontSize: 14, color: "#374151" }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: "700", color: valueColor ?? "#1F2937" }}>{value}</Text>
    </View>
  );
}

const styles = {
  floatCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, elevation: 8,
    shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10,
  },
  floatLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" as const, marginBottom: 6 },
  floatVal:   { fontSize: 26, fontWeight: "800" as const, color: "#1F2937" },
  floatUnit:  { fontSize: 14, fontWeight: "500" as const },
  floatDiff:  { fontSize: 12, fontWeight: "600" as const, marginTop: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "700" as const, color: "#9CA3AF", letterSpacing: 1, marginBottom: 10 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
    overflow: "hidden" as const,
  },
};
