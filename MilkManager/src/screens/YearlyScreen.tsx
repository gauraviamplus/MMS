import React, { useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert, useWindowDimensions, Platform,
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

const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function r1(n: number) { return Math.round(n * 10) / 10; }
function isLeapYear(y: number) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function BarChart({ data, width }: { data: { cow: number; buffalo: number }[]; width: number }) {
  const ML = 44, MR = 10, MT = 10, MB = 40;
  const W = width - ML - MR;
  const H = 160;
  const maxVal = Math.max(...data.map(d => Math.max(d.cow, d.buffalo)), 1);
  const yMax = Math.ceil(maxVal / 450) * 450 || 1800;
  const yLabels = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map(v => Math.round(v));
  const groupW = W / 12;
  const barW = Math.max((groupW - 6) / 2, 4);

  return (
    <Svg width={width} height={H + MT + MB}>
      {yLabels.map((v, i) => {
        const y = MT + H - (v / yMax) * H;
        return (
          <G key={i}>
            <SvgLine x1={ML} y1={y} x2={ML + W} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <SvgText x={ML - 4} y={y + 4} fontSize={8} fill={C.gray400} textAnchor="end">
              {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            </SvgText>
          </G>
        );
      })}
      {data.map((d, i) => {
        const cx   = ML + i * groupW + groupW / 2;
        const x1   = cx - barW - 1;
        const x2   = cx + 1;
        const cowH = (d.cow     / yMax) * H;
        const bufH = (d.buffalo / yMax) * H;
        return (
          <G key={i}>
            <Rect x={x1} y={MT + H - cowH} width={barW} height={Math.max(cowH, 0)} fill={C.purpleLight} rx={2} />
            <Rect x={x2} y={MT + H - bufH} width={barW} height={Math.max(bufH, 0)} fill={C.purple}      rx={2} />
            <SvgText x={cx} y={MT + H + 12} fontSize={7} fill={C.gray500} textAnchor="middle">{MONTH_SHORT[i]}</SvgText>
          </G>
        );
      })}
      <SvgLine x1={ML} y1={MT + H} x2={ML + W} y2={MT + H} stroke="#D1D5DB" strokeWidth={1} />
      <G>
        <Rect x={ML}      y={MT + H + 26} width={8} height={8} fill={C.purpleLight} rx={1} />
        <SvgText x={ML + 11} y={MT + H + 34} fontSize={8} fill={C.gray500}>Cow</SvgText>
        <Rect x={ML + 38} y={MT + H + 26} width={8} height={8} fill={C.purple} rx={1} />
        <SvgText x={ML + 51} y={MT + H + 34} fontSize={8} fill={C.gray500}>Buffalo</SvgText>
      </G>
    </Svg>
  );
}

function LineChart({ data, width }: { data: number[]; width: number }) {
  const ML = 44, MR = 10, MT = 10, MB = 40;
  const W = width - ML - MR;
  const H = 160;
  const maxVal = Math.max(...data, 1);
  const yMax = Math.ceil(maxVal / 750) * 750 || 3000;
  const yLabels = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map(v => Math.round(v));
  const n = data.length;
  const pts = data.map((v, i) => ({ x: ML + (i / (n - 1)) * W, y: MT + H - (v / yMax) * H }));
  const polyStr = pts.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={width} height={H + MT + MB}>
      {yLabels.map((v, i) => {
        const y = MT + H - (v / yMax) * H;
        return (
          <G key={i}>
            <SvgLine x1={ML} y1={y} x2={ML + W} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <SvgText x={ML - 4} y={y + 4} fontSize={8} fill={C.gray400} textAnchor="end">
              {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            </SvgText>
          </G>
        );
      })}
      <Polyline points={polyStr} fill="none" stroke={C.greenChart} strokeWidth={2} />
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={C.card} stroke={C.greenChart} strokeWidth={2} />
      ))}
      {data.map((_, i) => (
        <SvgText key={i} x={ML + (i / (n - 1)) * W} y={MT + H + 12} fontSize={7} fill={C.gray500} textAnchor="middle">{MONTH_SHORT[i]}</SvgText>
      ))}
      <SvgLine x1={ML} y1={MT + H} x2={ML + W} y2={MT + H} stroke="#D1D5DB" strokeWidth={1} />
      <G>
        <SvgLine x1={ML} y1={MT + H + 30} x2={ML + 14} y2={MT + H + 30} stroke={C.greenChart} strokeWidth={2} />
        <Circle cx={ML + 7} cy={MT + H + 30} r={3} fill={C.card} stroke={C.greenChart} strokeWidth={2} />
        <SvgText x={ML + 18} y={MT + H + 34} fontSize={8} fill={C.gray500}>Total</SvgText>
      </G>
    </Svg>
  );
}

const NOW = new Date();

type ReportTab = "monthly" | "yearly";

interface Props {
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
}

export default function YearlyScreen({ activeTab, onTabChange }: Props) {
  const [year, setYear] = useState(NOW.getFullYear());
  const { width: screenW } = useWindowDimensions();
  const { entries: allEntries } = useData();
  const { t } = useLanguage();

  const data = useMemo(() => {
    const months = MONTH_NAMES.map((name, i) => {
      const m   = String(i + 1).padStart(2, "0");
      const pfx = `${year}-${m}`;
      const ent = allEntries.filter(e => e.date.startsWith(pfx));
      const cow = r1(ent.filter(e => e.animalType === "cow").    reduce((s, e) => s + e.quantity, 0));
      const buf = r1(ent.filter(e => e.animalType === "buffalo").reduce((s, e) => s + e.quantity, 0));
      return { name, short: MONTH_SHORT[i], cow, buffalo: buf, total: r1(cow + buf) };
    });
    const totalCow = r1(months.reduce((s, m) => s + m.cow,     0));
    const totalBuf = r1(months.reduce((s, m) => s + m.buffalo, 0));
    const totalAll = r1(totalCow + totalBuf);
    const days     = isLeapYear(year) ? 366 : 365;
    const dailyAvg = r1(totalAll / days);
    const avgMonth = r1(totalAll / 12);
    const avgCow   = r1(totalCow / 12);
    const avgBuf   = r1(totalBuf / 12);
    const withData = months.filter(m => m.total > 0).sort((a, b) => b.total - a.total);
    const highest  = withData[0]  ?? null;
    const lowest   = withData[withData.length - 1] ?? months[11];
    const avgMonthTotal = withData.length > 0 ? r1(withData.reduce((s, m) => s + m.total, 0) / withData.length) : 0;
    return { months, totalCow, totalBuf, totalAll, dailyAvg, avgMonth, avgCow, avgBuf, highest, lowest, avgMonthTotal };
  }, [year, allEntries]);

  const chartW   = Math.max((screenW - 64) / 2, 260);
  const barData  = data.months.map(m => ({ cow: m.cow, buffalo: m.buffalo }));
  const lineData = data.months.map(m => m.total);

  function exportCSV() {
    const headers = ["Month", "Cow Milk (L)", "Buffalo Milk (L)", "Total (L)", "Status"];
    const dataRows = data.months.map(m => [m.name, m.cow.toFixed(1), m.buffalo.toFixed(1), m.total.toFixed(1), m.total > 0 ? (m.total >= data.avgMonthTotal ? "Above Avg" : "Below Avg") : "No Data"]);
    dataRows.push(["Yearly Totals", data.totalCow.toFixed(1), data.totalBuf.toFixed(1), data.totalAll.toFixed(1), ""]);
    const csv = [headers, ...dataRows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.setAttribute("download", `yearly_report_${year}.csv`);
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
    } else {
      Alert.alert("Export", "Open in browser to download as CSV.");
    }
  }

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
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>{t("yearlyReport")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {navBtn("‹", () => setYear(y => y - 1), true)}
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff", minWidth: 50, textAlign: "center" }}>{year}</Text>
            {navBtn("›", () => setYear(y => y + 1), true)}
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
            { label: t("totalCowMilk"),    value: data.totalCow, avg: data.avgCow,   unit: t("perMonthUnit"), accent: false },
            { label: t("totalBuffaloMilk"),value: data.totalBuf, avg: data.avgBuf,   unit: t("perMonthUnit"), accent: false },
            { label: t("annualTotal"),     value: data.totalAll, avg: data.avgMonth, unit: t("perMonthUnit"), accent: true  },
          ].map(({ label, value, avg, unit, accent }) => (
            <View key={label} style={{ backgroundColor: accent ? C.purple : C.card, borderRadius: 14, padding: 18, width: 185, marginRight: 12, elevation: accent ? 3 : 2, shadowColor: "#000", shadowOffset: { width: 0, height: accent ? 2 : 1 }, shadowOpacity: accent ? 0.15 : 0.08, shadowRadius: accent ? 4 : 3 }}>
              <Text style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.75)" : C.gray500, fontWeight: "500", marginBottom: 10 }}>{label}</Text>
              <Text style={{ fontSize: 28, fontWeight: "700", color: accent ? "#fff" : C.purple }}>{value}L</Text>
              <Text style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.6)" : C.gray400, marginTop: 4 }}>{t("avgPrefix")} {avg}{unit}</Text>
            </View>
          ))}
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 18, width: 185, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 12, color: C.gray500, fontWeight: "500", marginBottom: 10 }}>{t("dailyAverage")}</Text>
            <Text style={{ fontSize: 28, fontWeight: "700", color: C.green }}>{data.dailyAvg}L</Text>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>{t("basedOn")} {isLeapYear(year) ? 366 : 365} {t("daysUnit")}</Text>
          </View>
        </ScrollView>

        {/* Highest / Lowest Month */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>📈</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900 }}>{t("highestProductionMonth")}</Text>
            </View>
            {data.highest ? (
              <>
                <Text style={{ fontSize: 22, fontWeight: "700", color: C.gray900, marginBottom: 14 }}>{data.highest.short}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("cow")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: C.purple }}>{data.highest.cow}L</Text></View>
                  <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("buffalo")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: C.purpleLight }}>{data.highest.buffalo}L</Text></View>
                  <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("total")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: C.gray700 }}>{data.highest.total}L</Text></View>
                </View>
              </>
            ) : (
              <Text style={{ color: C.gray400, fontSize: 13 }}>{t("noDataAvailable")}</Text>
            )}
          </View>
          <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>📉</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900 }}>{t("lowestProductionMonth")}</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: "700", color: C.gray900, marginBottom: 14 }}>{data.lowest.short}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("cow")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: data.lowest.cow > 0 ? C.purple : C.orange }}>{data.lowest.cow}L</Text></View>
              <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("buffalo")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: data.lowest.buffalo > 0 ? C.purpleLight : C.orange }}>{data.lowest.buffalo}L</Text></View>
              <View><Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>{t("total")}</Text><Text style={{ fontSize: 15, fontWeight: "600", color: data.lowest.total > 0 ? C.gray700 : C.orange }}>{data.lowest.total}L</Text></View>
            </View>
          </View>
        </View>

        {/* Charts */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900, marginBottom: 8 }}>{t("monthlyProductionBreakdown")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart data={barData} width={Math.max(chartW, 300)} />
            </ScrollView>
          </View>
          <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900, marginBottom: 8 }}>{t("totalProductionTrend")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart data={lineData} width={Math.max(chartW, 300)} />
            </ScrollView>
          </View>
        </View>

        {/* Monthly Breakdown Table */}
        <View style={{ backgroundColor: C.card, borderRadius: 14, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "600", color: C.gray900 }}>{t("monthlyBreakdown")}</Text>
              <Text style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>12 {t("monthsUnit")} · {year}</Text>
            </View>
            <TouchableOpacity onPress={exportCSV} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.purple, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 }}>
              <Text style={{ fontSize: 14 }}>⬇️</Text>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{t("exportToExcel")}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 560 }}>
              <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                {[{ l: t("monthCol"), w: 140 }, { l: t("cowMilkCol"), w: 130 }, { l: t("buffaloMilkCol"), w: 130 }, { l: t("totalCol"), w: 110 }, { l: t("statusCol"), w: 120 }].map(({ l, w }) => (
                  <Text key={l} style={{ width: w, fontSize: 10, fontWeight: "600", color: C.gray500, letterSpacing: 0.5 }}>{l}</Text>
                ))}
              </View>
              {data.months.map((m, i) => {
                const hasData  = m.total > 0;
                const aboveAvg = hasData && m.total >= data.avgMonthTotal;
                return (
                  <View key={m.name} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: i % 2 === 0 ? C.card : "#FAFAFA" }}>
                    <Text style={{ width: 140, fontSize: 13, fontWeight: hasData ? "600" : "400", color: hasData ? C.gray900 : C.gray500 }}>{m.name}</Text>
                    <Text style={{ width: 130, fontSize: 13, color: hasData ? C.purple      : C.gray400 }}>{hasData ? `${m.cow.toFixed(1)}L` : "-"}</Text>
                    <Text style={{ width: 130, fontSize: 13, color: hasData ? C.purpleLight : C.gray400 }}>{hasData ? `${m.buffalo.toFixed(1)}L` : "-"}</Text>
                    <Text style={{ width: 110, fontSize: 13, fontWeight: hasData ? "600" : "400", color: hasData ? C.gray900 : C.gray400 }}>{hasData ? `${m.total.toFixed(1)}L` : "-"}</Text>
                    <View style={{ width: 120 }}>
                      {hasData ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={{ fontSize: 11, marginRight: 3 }}>{aboveAvg ? "📈" : "📉"}</Text>
                          <Text style={{ fontSize: 11, fontWeight: "600", color: aboveAvg ? C.green : C.orange }}>{aboveAvg ? t("aboveAvg") : t("belowAvg")}</Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: 11, color: C.gray400 }}>{t("noData")}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.purpleBg }}>
                <Text style={{ width: 140, fontSize: 13, fontWeight: "700", color: C.gray900 }}>{t("yearlyTotals")}</Text>
                <Text style={{ width: 130, fontSize: 13, fontWeight: "700", color: C.purple      }}>{data.totalCow.toFixed(1)}L</Text>
                <Text style={{ width: 130, fontSize: 13, fontWeight: "700", color: C.purpleLight }}>{data.totalBuf.toFixed(1)}L</Text>
                <Text style={{ width: 110, fontSize: 13, fontWeight: "700", color: C.gray900     }}>{data.totalAll.toFixed(1)}L</Text>
                <View style={{ width: 120 }} />
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
