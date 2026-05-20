import React, { useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, useWindowDimensions, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Rect, Circle, Polyline, Line as SvgLine, Text as SvgText, G,
} from "react-native-svg";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";

const C = {
  purple:      "#7C3AED",
  purpleLight: "#8B5CF6",
  purpleDark:  "#5B21B6",
  green:       "#16A34A",
  greenChart:  "#10B981",
  red:         "#DC2626",
  orange:      "#EA580C",
  bg:          "#F3F4F6",
  card:        "#FFFFFF",
  border:      "#E5E7EB",
  gray900:     "#111827",
  gray700:     "#374151",
  gray500:     "#6B7280",
  gray400:     "#9CA3AF",
};

function round1(n: number) { return Math.round(n * 10) / 10; }

function getCurrentWeekDays() {
  const now      = new Date();
  const day      = now.getDay(); // 0=Sun
  const monday   = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7)); // start of week (Mon)
  return Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    return {
      date:   iso,
      short:  d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }),
      xLabel: d.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  });
}

function getWeekLabel(days: { date: string }[]) {
  const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${fmt(days[0].date)} – ${fmt(days[6].date)}`;
}

function BarChart({ data, width }: { data: { cow: number; buffalo: number; label: string }[]; width: number }) {
  const ML = 38, MR = 10, MT = 10, MB = 44;
  const W = width - ML - MR;
  const H = 150;
  const allVals = data.flatMap(d => [d.cow, d.buffalo]);
  const MAX  = Math.max(Math.ceil(Math.max(...allVals, 10) * 1.2 / 50) * 50, 50);
  const step = MAX / 4;
  const yLabels = [0, step, step * 2, step * 3, MAX];
  const groupW  = W / data.length;
  const barW    = Math.max(Math.min(groupW * 0.35, 14), 4);
  const gap     = 2;
  const pairW   = barW * 2 + gap;

  return (
    <Svg width={width} height={H + MT + MB}>
      {yLabels.map(v => {
        const y = MT + H - (v / MAX) * H;
        return (
          <G key={v}>
            <SvgLine x1={ML} y1={y} x2={ML + W} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <SvgText x={ML - 4} y={y + 4} fontSize={9} fill={C.gray400} textAnchor="end">{Math.round(v)}</SvgText>
          </G>
        );
      })}
      {data.map((d, i) => {
        const cx    = ML + i * groupW + groupW / 2;
        const barX1 = cx - pairW / 2;
        const barX2 = barX1 + barW + gap;
        const cowH  = (d.cow     / MAX) * H;
        const bufH  = (d.buffalo / MAX) * H;
        return (
          <G key={i}>
            <Rect x={barX1} y={MT + H - cowH} width={barW} height={Math.max(cowH, 0)} fill={C.purpleLight} rx={2} />
            <Rect x={barX2} y={MT + H - bufH} width={barW} height={Math.max(bufH, 0)} fill={C.purple}      rx={2} />
            {i % 5 === 0 && (
              <SvgText x={cx} y={MT + H + 14} fontSize={8} fill={C.gray500} textAnchor="middle">{d.label}</SvgText>
            )}
          </G>
        );
      })}
      <SvgLine x1={ML} y1={MT + H} x2={ML + W} y2={MT + H} stroke="#D1D5DB" strokeWidth={1} />
      <G>
        <Rect x={ML}      y={MT + H + 28} width={8} height={8} fill={C.purpleLight} rx={1} />
        <SvgText x={ML + 11} y={MT + H + 36} fontSize={9} fill={C.gray500}>cow</SvgText>
        <Rect x={ML + 40} y={MT + H + 28} width={8} height={8} fill={C.purple} rx={1} />
        <SvgText x={ML + 53} y={MT + H + 36} fontSize={9} fill={C.gray500}>buffalo</SvgText>
      </G>
    </Svg>
  );
}

function LineChart({ data, width }: { data: { total: number; label: string }[]; width: number }) {
  const ML = 42, MR = 10, MT = 10, MB = 44;
  const W = width - ML - MR;
  const H = 150;
  const maxVal = Math.max(...data.map(d => d.total), 10);
  const MAX    = Math.max(Math.ceil(maxVal * 1.2 / 100) * 100, 100);
  const step   = MAX / 4;
  const yLabels = [0, step, step * 2, step * 3, MAX];
  const n = data.length;
  const pts = data.map((d, i) => ({
    x: ML + (n > 1 ? (i / (n - 1)) : 0.5) * W,
    y: MT + H - (d.total / MAX) * H,
  }));
  const pointsStr = pts.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={width} height={H + MT + MB}>
      {yLabels.map(v => {
        const y = MT + H - (v / MAX) * H;
        return (
          <G key={v}>
            <SvgLine x1={ML} y1={y} x2={ML + W} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <SvgText x={ML - 4} y={y + 4} fontSize={9} fill={C.gray400} textAnchor="end">{Math.round(v)}</SvgText>
          </G>
        );
      })}
      <Polyline points={pointsStr} fill="none" stroke={C.greenChart} strokeWidth={2} />
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={C.card} stroke={C.greenChart} strokeWidth={2} />
      ))}
      {data.map((d, i) => i % 5 === 0 && (
        <SvgText key={i} x={ML + (n > 1 ? (i / (n - 1)) : 0.5) * W} y={MT + H + 14} fontSize={8} fill={C.gray500} textAnchor="middle">{d.label}</SvgText>
      ))}
      <SvgLine x1={ML} y1={MT + H} x2={ML + W} y2={MT + H} stroke="#D1D5DB" strokeWidth={1} />
      <G>
        <SvgLine x1={ML} y1={MT + H + 34} x2={ML + 16} y2={MT + H + 34} stroke={C.greenChart} strokeWidth={2} />
        <Circle cx={ML + 8} cy={MT + H + 34} r={3} fill={C.card} stroke={C.greenChart} strokeWidth={2} />
        <SvgText x={ML + 20} y={MT + H + 38} fontSize={9} fill={C.gray500}>total</SvgText>
      </G>
    </Svg>
  );
}

export default function WeeklyScreen() {
  const { width: screenW } = useWindowDimensions();
  const { entries: allEntries } = useData();
  const { t } = useLanguage();

  const WEEK_DAYS  = useMemo(() => getCurrentWeekDays(), []);
  const weekLabel  = useMemo(() => getWeekLabel(WEEK_DAYS), [WEEK_DAYS]);
  const today      = new Date().toISOString().split("T")[0];
  const pastDays   = useMemo(() => WEEK_DAYS.filter(d => d.date <= today), [WEEK_DAYS, today]);
  const totalDays  = pastDays.length;

  const { days, totals, highest, lowest, avgCow, avgBuffalo, avgTotal } = useMemo(() => {
    const days = WEEK_DAYS.map(w => {
      const entries  = allEntries.filter(e => e.date === w.date);
      const cow      = round1(entries.filter(e => e.animalType === "cow").reduce((s, e) => s + e.quantity, 0));
      const buffalo  = round1(entries.filter(e => e.animalType === "buffalo").reduce((s, e) => s + e.quantity, 0));
      const total    = round1(cow + buffalo);
      return { ...w, cow, buffalo, total };
    });
    const activeDays   = days.filter(d => d.date <= today);
    const totalCow     = round1(activeDays.reduce((s, d) => s + d.cow, 0));
    const totalBuffalo = round1(activeDays.reduce((s, d) => s + d.buffalo, 0));
    const totalAll     = round1(totalCow + totalBuffalo);
    const avgCow       = round1(totalDays > 0 ? totalCow     / totalDays : 0);
    const avgBuffalo   = round1(totalDays > 0 ? totalBuffalo  / totalDays : 0);
    const avgTotal     = round1(totalDays > 0 ? totalAll      / totalDays : 0);
    const sorted       = [...activeDays].sort((a, b) => b.total - a.total);
    return {
      days,
      totals: { cow: totalCow, buffalo: totalBuffalo, all: totalAll },
      highest: sorted[0] ?? days[0],
      lowest:  sorted[sorted.length - 1] ?? days[0],
      avgCow, avgBuffalo, avgTotal,
    };
  }, [allEntries, WEEK_DAYS, today, totalDays]);

  const chartW   = Math.max(WEEK_DAYS.length * 40 + 60, 300);
  const barData  = WEEK_DAYS.map(d => { const day = days.find(x => x.date === d.date)!; return { cow: day.cow, buffalo: day.buffalo, label: d.xLabel }; });
  const lineData = WEEK_DAYS.map(d => { const day = days.find(x => x.date === d.date)!; return { total: day.total, label: d.xLabel }; });

  function dayLabel(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
  }

  function exportCSV() {
    const headers  = ["Date", "Cow Milk (L)", "Buffalo Milk (L)", "Total (L)", "Performance"];
    const dataRows = WEEK_DAYS.map(d => {
      const day = days.find(x => x.date === d.date)!;
      return [d.short, day.cow.toFixed(1), day.buffalo.toFixed(1), day.total.toFixed(1),
        day.total > 0 ? (day.total >= avgTotal ? "Above Avg" : "Below Avg") : "-"];
    });
    dataRows.push(["Averages", avgCow.toFixed(1), avgBuffalo.toFixed(1), avgTotal.toFixed(1), ""]);
    const csv = [headers, ...dataRows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href  = url; link.setAttribute("download", `weekly_report_${WEEK_DAYS[0].date}.csv`);
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
    } else {
      Alert.alert("Export", "Open in browser to download as CSV.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ backgroundColor: C.bg }} edges={["top"]}>
        <View style={{
          backgroundColor: C.purple, borderRadius: 24, marginHorizontal: 12, marginTop: 8,
          overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
          elevation: 8, shadowColor: C.purple,
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
        }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>{t("weeklyReport")}</Text>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{weekLabel}</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 4 }} />

        {/* Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ paddingRight: 4 }}>
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 18, width: 200, marginRight: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 12, color: C.gray500, fontWeight: "500", marginBottom: 10 }}>{t("totalCowMilk7Days")}</Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: C.purple }}>{totals.cow}L</Text>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>{t("avgPrefix")} {avgCow}L {t("perDay")}</Text>
          </View>
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 18, width: 200, marginRight: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 12, color: C.gray500, fontWeight: "500", marginBottom: 10 }}>{t("totalBuffaloMilk7Days")}</Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: C.purple }}>{totals.buffalo}L</Text>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>{t("avgPrefix")} {avgBuffalo}L {t("perDay")}</Text>
          </View>
          <View style={{ backgroundColor: C.purple, borderRadius: 14, padding: 18, width: 200, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500", marginBottom: 10 }}>{t("combinedTotal7Days")}</Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: "#FFFFFF" }}>{totals.all}L</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{t("avgPrefix")} {avgTotal}L {t("perDay")}</Text>
          </View>
        </ScrollView>

        {/* Highest / Lowest */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          {[
            { label: t("highestProductionDay"), icon: "📈", day: highest, colors: { cow: C.purple, buf: C.purpleLight, total: C.gray700 } },
            { label: t("lowestProductionDay"),  icon: "📉", day: lowest,  colors: { cow: C.orange, buf: C.orange, total: C.orange } },
          ].map(({ label, icon, day, colors }) => (
            <View key={label} style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ fontSize: 14, marginRight: 6 }}>{icon}</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900 }}>{label}</Text>
              </View>
              <Text style={{ fontSize: 11, color: C.gray500, marginBottom: 4 }}>{t("date")}</Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: C.gray900, marginBottom: 14 }}>{dayLabel(day.date)}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("cow")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: colors.cow }}>{day.cow}L</Text></View>
                <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("buffalo")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: colors.buf }}>{day.buffalo}L</Text></View>
                <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("total")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: colors.total }}>{day.total}L</Text></View>
              </View>
            </View>
          ))}
        </View>

        {/* Day-by-Day Breakdown */}
        <View style={{ backgroundColor: C.card, borderRadius: 14, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, overflow: "hidden" }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: C.gray900 }}>{t("dayByDayBreakdown")}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 560 }}>
              <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                {[
                  { h: t("dateCol"), w: 130 }, { h: t("cowMilkCol"), w: 110 },
                  { h: t("buffaloMilkCol"), w: 110 }, { h: t("totalCol"), w: 110 },
                  { h: t("performanceCol"), w: 120 },
                ].map(({ h, w }) => (
                  <Text key={h} style={{ width: w, fontSize: 10, fontWeight: "600", color: C.gray500, letterSpacing: 0.5 }}>{h}</Text>
                ))}
              </View>
              {WEEK_DAYS.map((d, i) => {
                const day      = days.find(x => x.date === d.date)!;
                const aboveAvg = day.total >= avgTotal && day.total > 0;
                const hasData  = day.total > 0;
                return (
                  <View key={d.date} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: i % 2 === 0 ? C.card : "#FAFAFA" }}>
                    <Text style={{ width: 130, fontSize: 13, color: C.gray700 }}>{d.short}</Text>
                    <Text style={{ width: 110, fontSize: 13, fontWeight: "500", color: C.purple }}>{day.cow.toFixed(1)}L</Text>
                    <Text style={{ width: 110, fontSize: 13, fontWeight: "500", color: C.purpleLight }}>{day.buffalo.toFixed(1)}L</Text>
                    <Text style={{ width: 110, fontSize: 13, fontWeight: "600", color: C.gray900 }}>{day.total.toFixed(1)}L</Text>
                    <View style={{ width: 120, flexDirection: "row", alignItems: "center" }}>
                      {hasData ? (
                        <><Text style={{ fontSize: 12, marginRight: 4 }}>{aboveAvg ? "📈" : "📉"}</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: aboveAvg ? C.green : C.red }}>{aboveAvg ? t("aboveAvg") : t("belowAvg")}</Text></>
                      ) : (
                        <Text style={{ fontSize: 12, color: C.gray400 }}>—</Text>
                      )}
                    </View>
                  </View>
                );
              })}
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, backgroundColor: "#F5F3FF" }}>
                <Text style={{ width: 130, fontSize: 13, fontWeight: "700", color: C.gray900 }}>{t("averages")}</Text>
                <Text style={{ width: 110, fontSize: 13, fontWeight: "700", color: C.purple }}>{avgCow.toFixed(1)}L</Text>
                <Text style={{ width: 110, fontSize: 13, fontWeight: "700", color: C.purpleLight }}>{avgBuffalo.toFixed(1)}L</Text>
                <Text style={{ width: 110, fontSize: 13, fontWeight: "700", color: C.gray900 }}>{avgTotal.toFixed(1)}L</Text>
                <View style={{ width: 120 }} />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Charts */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900, marginBottom: 8 }}>{t("dailyProduction")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart data={barData} width={chartW} />
            </ScrollView>
          </View>
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900, marginBottom: 8 }}>{t("totalProductionTrend")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart data={lineData} width={chartW} />
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity onPress={exportCSV} style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.purple, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignSelf: "flex-start", gap: 8 }}>
          <Text style={{ fontSize: 16 }}>⬇️</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{t("exportToExcel")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
