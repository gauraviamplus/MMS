import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";

const C = {
  purple:      "#7C3AED",
  purpleLight: "#8B5CF6",
  green:       "#16A34A",
  red:         "#DC2626",
  orange:      "#EA580C",
  bg:          "#F3F4F6",
  card:        "#FFFFFF",
  border:      "#E5E7EB",
  gray900:     "#111827",
  gray700:     "#374151",
  gray500:     "#6B7280",
  gray400:     "#9CA3AF",
  purpleBg:    "#F5F3FF",
};

function r1(n: number) { return Math.round(n * 10) / 10; }
function isoDate(d: Date) { return d.toISOString().split("T")[0]; }
function fmtMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function fmtShort(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function fmtWeekPeriod(startIso: string, endIso: string) {
  const s = new Date(startIso + "T00:00:00");
  const e = new Date(endIso   + "T00:00:00");
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}
function getMonthWeeks(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay  = new Date(year, month, 0);
  const ws = new Date(firstDay);
  const daysBackToTue = (ws.getDay() - 2 + 7) % 7;
  ws.setDate(ws.getDate() - daysBackToTue);
  const weeks: { label: string; start: string; end: string; period: string }[] = [];
  let n = 1, first = true;
  while (ws <= lastDay) {
    const we = new Date(ws);
    we.setDate(we.getDate() + (first ? 5 : 6));
    if (we > lastDay) we.setTime(lastDay.getTime());
    const s = isoDate(ws), e = isoDate(we);
    weeks.push({ label: `Week ${n}`, start: s, end: e, period: fmtWeekPeriod(s, e) });
    n++; first = false;
    ws.setTime(we.getTime()); ws.setDate(ws.getDate() + 1);
  }
  return weeks;
}
function getAllDates(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay  = new Date(year, month, 0);
  const cur      = new Date(firstDay);
  const daysBack = (cur.getDay() - 2 + 7) % 7;
  cur.setDate(cur.getDate() - daysBack);
  const dates: string[] = [];
  while (cur <= lastDay) { dates.push(isoDate(cur)); cur.setDate(cur.getDate() + 1); }
  return dates;
}
function sumCow(entries: any[]) { return r1(entries.filter(e => e.animalType === "cow").reduce((s, e) => s + e.quantity, 0)); }
function sumBuf(entries: any[]) { return r1(entries.filter(e => e.animalType === "buffalo").reduce((s, e) => s + e.quantity, 0)); }

const NOW = new Date();

type ReportTab = "monthly" | "yearly";

interface Props {
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
}

export default function MonthlyScreen({ activeTab, onTabChange }: Props) {
  const [year,  setYear]  = useState(NOW.getFullYear());
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const { entries: allEntries } = useData();
  const { t } = useLanguage();

  const data = useMemo(() => {
    const weeks    = getMonthWeeks(year, month);
    const allDates = getAllDates(year, month);
    const totalDays = new Date(year, month, 0).getDate();
    const dayMap = new Map<string, { cow: number; buffalo: number; total: number }>();
    allDates.forEach(d => {
      const ents = allEntries.filter(e => e.date === d);
      const cow = sumCow(ents), buf = sumBuf(ents);
      dayMap.set(d, { cow, buffalo: buf, total: r1(cow + buf) });
    });
    const monthDates = allDates.filter(d => d.startsWith(`${year}-${String(month).padStart(2, "0")}`));
    const totalCow   = r1(monthDates.reduce((s, d) => s + (dayMap.get(d)?.cow     ?? 0), 0));
    const totalBuf   = r1(monthDates.reduce((s, d) => s + (dayMap.get(d)?.buffalo ?? 0), 0));
    const totalAll   = r1(totalCow + totalBuf);
    const avgCow     = r1(totalCow / totalDays);
    const avgBuf     = r1(totalBuf / totalDays);
    const avgAll     = r1(totalAll / totalDays);
    const withData = monthDates.map(d => ({ date: d, ...(dayMap.get(d)!) })).filter(d => d.total > 0).sort((a, b) => b.total - a.total);
    const highest = withData[0];
    const lowest  = withData[withData.length - 1];
    const weekStats = weeks.map(w => {
      const wDates = allDates.filter(d => d >= w.start && d <= w.end);
      const cow  = r1(wDates.reduce((s, d) => s + (dayMap.get(d)?.cow     ?? 0), 0));
      const buf  = r1(wDates.reduce((s, d) => s + (dayMap.get(d)?.buffalo ?? 0), 0));
      return { ...w, cow, buffalo: buf, total: r1(cow + buf) };
    });
    const avgDailyTotal = withData.length > 0 ? r1(withData.reduce((s, d) => s + d.total, 0) / withData.length) : 0;
    return { allDates, dayMap, totalCow, totalBuf, totalAll, avgCow, avgBuf, avgAll, highest, lowest, weekStats, avgDailyTotal };
  }, [year, month, allEntries]);

  function prevMonth() { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); }
  function goToCurrentMonth() { setYear(NOW.getFullYear()); setMonth(NOW.getMonth() + 1); }

  const { allDates, dayMap, totalCow, totalBuf, totalAll, avgCow, avgBuf, avgAll, highest, lowest, weekStats, avgDailyTotal } = data;
  const totalDays = new Date(year, month, 0).getDate();

  const navBtn = (label: string, onPress: () => void, isCircle = false) => (
    <TouchableOpacity onPress={onPress}
      style={isCircle
        ? { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" }
        : { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16 }}>
      <Text style={{ fontSize: isCircle ? 18 : 12, color: "#fff", fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ backgroundColor: C.bg }} edges={["top"]}>
        <View style={{
          backgroundColor: C.purple, borderRadius: 24, marginHorizontal: 12, marginTop: 8,
          overflow: "hidden", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
          elevation: 8, shadowColor: C.purple,
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
        }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>{t("monthlyReport")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0 }}>
            {navBtn("‹", prevMonth, true)}
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff", minWidth: 80, textAlign: "center" }}>
              {new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long" })}
            </Text>
            {navBtn("›", nextMonth, true)}
          </View>
        </View>
      </SafeAreaView>

      {/* Monthly / Yearly toggle */}
      <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
        {(["monthly", "yearly"] as ReportTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2.5, borderBottomColor: activeTab === tab ? C.purple : "transparent" }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: activeTab === tab ? C.purple : C.gray500 }}>
              {tab === "monthly" ? `📅  ${t("tabMonthly")}` : `📊  ${t("tabYearly")}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 4 }} />

        {/* Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ paddingRight: 4 }}>
          {[
            { label: t("totalCowMilk"),     value: totalCow, avg: avgCow, accent: false },
            { label: t("totalBuffaloMilk"), value: totalBuf, avg: avgBuf, accent: false },
            { label: t("combinedTotal"),    value: totalAll, avg: avgAll, accent: true  },
          ].map(({ label, value, avg, accent }) => (
            <View key={label} style={{ backgroundColor: accent ? C.purple : C.card, borderRadius: 14, padding: 18, width: 190, marginRight: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
              <Text style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.75)" : C.gray500, fontWeight: "500", marginBottom: 10 }}>{label}</Text>
              <Text style={{ fontSize: 28, fontWeight: "700", color: accent ? "#fff" : C.purple }}>{value}L</Text>
              <Text style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.6)" : C.gray400, marginTop: 4 }}>{t("avgPrefix")} {avg}{t("perDayUnit")}</Text>
            </View>
          ))}
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 18, width: 190, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 12, color: C.gray500, fontWeight: "500", marginBottom: 10 }}>{t("vsPreviousMonth")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Text style={{ fontSize: 14, marginRight: 4 }}>{totalAll >= 0 ? "📈" : "📉"}</Text>
              <Text style={{ fontSize: 26, fontWeight: "700", color: C.green }}>—</Text>
            </View>
            <Text style={{ fontSize: 12, color: C.gray400 }}>—</Text>
          </View>
        </ScrollView>

        {/* Highest / Lowest Day */}
        {highest && lowest && (
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            {[
              { label: t("highestProductionDay"), icon: "📈", d: highest, color: C.gray700 },
              { label: t("lowestProductionDay"),  icon: "📉", d: lowest,  color: C.orange },
            ].map(({ label, icon, d, color }) => (
              <View key={label} style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, marginRight: 6 }}>{icon}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900 }}>{label}</Text>
                </View>
                <Text style={{ fontSize: 11, color: C.gray500, marginBottom: 2 }}>{t("date")}</Text>
                <Text style={{ fontSize: 18, fontWeight: "700", color: C.gray900, marginBottom: 14 }}>
                  {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("cow")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: C.purple }}>{d.cow}L</Text></View>
                  <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("buffalo")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: C.purpleLight }}>{d.buffalo}L</Text></View>
                  <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("total")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color }}>{d.total}L</Text></View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Week-by-Week */}
        <View style={{ backgroundColor: C.card, borderRadius: 14, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, overflow: "hidden" }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: C.gray900 }}>{t("weekByWeekBreakdown")}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 580 }}>
              <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                {[{ l: t("weekCol"), w: 80 }, { l: t("periodCol"), w: 140 }, { l: t("cowMilkCol"), w: 120 }, { l: t("buffaloMilkCol"), w: 120 }, { l: t("totalCol"), w: 100 }].map(({ l, w }) => (
                  <Text key={l} style={{ width: w, fontSize: 10, fontWeight: "600", color: C.gray500, letterSpacing: 0.5 }}>{l}</Text>
                ))}
              </View>
              {weekStats.map((w, i) => (
                <View key={w.label} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: i % 2 === 0 ? C.card : "#FAFAFA" }}>
                  <Text style={{ width: 80,  fontSize: 13, fontWeight: "600", color: C.gray900 }}>{w.label}</Text>
                  <Text style={{ width: 140, fontSize: 13, color: C.gray500 }}>{w.period}</Text>
                  <Text style={{ width: 120, fontSize: 13, fontWeight: "500", color: w.cow     > 0 ? C.purple      : C.gray400 }}>{w.cow.toFixed(1)}L</Text>
                  <Text style={{ width: 120, fontSize: 13, fontWeight: "500", color: w.buffalo > 0 ? C.purpleLight : C.gray400 }}>{w.buffalo.toFixed(1)}L</Text>
                  <Text style={{ width: 100, fontSize: 13, fontWeight: "600", color: w.total   > 0 ? C.gray900    : C.gray400 }}>{w.total.toFixed(1)}L</Text>
                </View>
              ))}
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, backgroundColor: C.purpleBg }}>
                <Text style={{ width: 80,  fontSize: 13, fontWeight: "700", color: C.gray900 }}>{t("monthlyTotals")}</Text>
                <Text style={{ width: 140 }} />
                <Text style={{ width: 120, fontSize: 13, fontWeight: "700", color: C.purple      }}>{totalCow.toFixed(1)}L</Text>
                <Text style={{ width: 120, fontSize: 13, fontWeight: "700", color: C.purpleLight }}>{totalBuf.toFixed(1)}L</Text>
                <Text style={{ width: 100, fontSize: 13, fontWeight: "700", color: C.gray900     }}>{totalAll.toFixed(1)}L</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Daily Production Details */}
        <View style={{ backgroundColor: C.card, borderRadius: 14, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, overflow: "hidden" }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: C.gray900 }}>{t("dailyProductionDetails")}</Text>
            <Text style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>{totalDays} {t("daysUnit")} · {fmtMonth(year, month)}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 560 }}>
              <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                {[{ l: t("dateCol"), w: 150 }, { l: t("cow"), w: 110 }, { l: t("buffalo"), w: 120 }, { l: t("totalCol"), w: 110 }, { l: t("statusCol"), w: 120 }].map(({ l, w }) => (
                  <Text key={l} style={{ width: w, fontSize: 10, fontWeight: "600", color: C.gray500, letterSpacing: 0.5 }}>{l}</Text>
                ))}
              </View>
              <ScrollView style={{ maxHeight: 320 }} nestedScrollEnabled showsVerticalScrollIndicator>
                {allDates.map((iso, i) => {
                  const d        = dayMap.get(iso);
                  const hasData  = (d?.total ?? 0) > 0;
                  const aboveAvg = hasData && (d!.total >= avgDailyTotal);
                  return (
                    <View key={iso} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: i % 2 === 0 ? C.card : "#FAFAFA" }}>
                      <Text style={{ width: 150, fontSize: 13, color: C.gray700 }}>{fmtShort(iso)}</Text>
                      <Text style={{ width: 110, fontSize: 13, color: hasData ? C.purple      : C.gray400 }}>{hasData ? `${d!.cow.toFixed(1)}L` : "-"}</Text>
                      <Text style={{ width: 120, fontSize: 13, color: hasData ? C.purpleLight : C.gray400 }}>{hasData ? `${d!.buffalo.toFixed(1)}L` : "-"}</Text>
                      <Text style={{ width: 110, fontSize: 13, fontWeight: hasData ? "600" : "400", color: hasData ? C.gray900 : C.gray400 }}>{hasData ? `${d!.total.toFixed(1)}L` : "-"}</Text>
                      <View style={{ width: 120 }}>
                        {hasData ? (
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontSize: 11, marginRight: 3 }}>{aboveAvg ? "📈" : "📉"}</Text>
                            <Text style={{ fontSize: 11, fontWeight: "600", color: aboveAvg ? C.green : C.red }}>{aboveAvg ? t("aboveAvg") : t("belowAvg")}</Text>
                          </View>
                        ) : (
                          <Text style={{ fontSize: 11, color: C.gray400 }}>{t("noData")}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
