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

// ─── Tokens ───────────────────────────────────────────────────────────────────
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

// ─── Week dates (Sat Apr 18 – Fri Apr 24) ────────────────────────────────────
const WEEK = [
  { date: "2026-04-18", short: "Sat, Apr 18", xLabel: "Apr 18" },
  { date: "2026-04-19", short: "Sun, Apr 19", xLabel: "Apr 19" },
  { date: "2026-04-20", short: "Mon, Apr 20", xLabel: "Apr 20" },
  { date: "2026-04-21", short: "Tue, Apr 21", xLabel: "Apr 21" },
  { date: "2026-04-22", short: "Wed, Apr 22", xLabel: "Apr 22" },
  { date: "2026-04-23", short: "Thu, Apr 23", xLabel: "Apr 23" },
  { date: "2026-04-24", short: "Fri, Apr 24", xLabel: "Apr 24" },
];

function round1(n: number) { return Math.round(n * 10) / 10; }

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({
  data, width,
}: {
  data: { cow: number; buffalo: number; label: string }[];
  width: number;
}) {
  const ML = 38, MR = 10, MT = 10, MB = 44;
  const W = width - ML - MR;
  const H = 150;
  const MAX = 260;
  const yLabels = [0, 65, 130, 195, 260];
  const groupW  = W / data.length;
  const barW    = 11;
  const gap     = 3;
  const pairW   = barW * 2 + gap;

  return (
    <Svg width={width} height={H + MT + MB}>
      {/* Y-axis grid + labels */}
      {yLabels.map(v => {
        const y = MT + H - (v / MAX) * H;
        return (
          <G key={v}>
            <SvgLine x1={ML} y1={y} x2={ML + W} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <SvgText x={ML - 4} y={y + 4} fontSize={9} fill={C.gray400} textAnchor="end">{v}</SvgText>
          </G>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const cx    = ML + i * groupW + groupW / 2;
        const barX1 = cx - pairW / 2;
        const barX2 = barX1 + barW + gap;
        const cowH  = (d.cow    / MAX) * H;
        const bufH  = (d.buffalo / MAX) * H;
        return (
          <G key={i}>
            {/* Cow bar */}
            <Rect x={barX1} y={MT + H - cowH} width={barW} height={Math.max(cowH, 0)} fill={C.purpleLight} rx={2} />
            {/* Buffalo bar */}
            <Rect x={barX2} y={MT + H - bufH} width={barW} height={Math.max(bufH, 0)} fill={C.purple}      rx={2} />
            {/* X label */}
            <SvgText x={cx} y={MT + H + 14} fontSize={8} fill={C.gray500} textAnchor="middle">{d.label}</SvgText>
          </G>
        );
      })}

      {/* X-axis line */}
      <SvgLine x1={ML} y1={MT + H} x2={ML + W} y2={MT + H} stroke="#D1D5DB" strokeWidth={1} />

      {/* Legend */}
      <G>
        <Rect x={ML}      y={MT + H + 28} width={8} height={8} fill={C.purpleLight} rx={1} />
        <SvgText x={ML + 11} y={MT + H + 36} fontSize={9} fill={C.gray500}>cow</SvgText>
        <Rect x={ML + 40} y={MT + H + 28} width={8} height={8} fill={C.purple} rx={1} />
        <SvgText x={ML + 53} y={MT + H + 36} fontSize={9} fill={C.gray500}>buffalo</SvgText>
      </G>
    </Svg>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function LineChart({
  data, width,
}: {
  data: { total: number; label: string }[];
  width: number;
}) {
  const ML = 42, MR = 10, MT = 10, MB = 44;
  const W = width - ML - MR;
  const H = 150;
  const MAX = 600;
  const yLabels = [0, 150, 300, 450, 600];
  const n = data.length;

  const pts = data.map((d, i) => ({
    x: ML + (i / (n - 1)) * W,
    y: MT + H - (d.total / MAX) * H,
  }));
  const pointsStr = pts.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={width} height={H + MT + MB}>
      {/* Y-axis grid + labels */}
      {yLabels.map(v => {
        const y = MT + H - (v / MAX) * H;
        return (
          <G key={v}>
            <SvgLine x1={ML} y1={y} x2={ML + W} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <SvgText x={ML - 4} y={y + 4} fontSize={9} fill={C.gray400} textAnchor="end">{v}</SvgText>
          </G>
        );
      })}

      {/* Line */}
      <Polyline points={pointsStr} fill="none" stroke={C.greenChart} strokeWidth={2} />

      {/* Circles */}
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={C.card} stroke={C.greenChart} strokeWidth={2} />
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <SvgText
          key={i}
          x={ML + (i / (n - 1)) * W}
          y={MT + H + 14}
          fontSize={8}
          fill={C.gray500}
          textAnchor="middle"
        >
          {d.label}
        </SvgText>
      ))}

      {/* X-axis line */}
      <SvgLine x1={ML} y1={MT + H} x2={ML + W} y2={MT + H} stroke="#D1D5DB" strokeWidth={1} />

      {/* Legend */}
      <G>
        <SvgLine x1={ML} y1={MT + H + 34} x2={ML + 16} y2={MT + H + 34} stroke={C.greenChart} strokeWidth={2} />
        <Circle cx={ML + 8} cy={MT + H + 34} r={3} fill={C.card} stroke={C.greenChart} strokeWidth={2} />
        <SvgText x={ML + 20} y={MT + H + 38} fontSize={9} fill={C.gray500}>total</SvgText>
      </G>
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function WeeklyScreen() {
  const { width: screenW } = useWindowDimensions();
  const { entries: allEntries } = useData();

  const { days, totals, highest, lowest, avgCow, avgBuffalo, avgTotal } = useMemo(() => {
    const days = WEEK.map(w => {
      const entries = allEntries.filter(e => e.date === w.date);
      const cow     = round1(entries.filter(e => e.animalType === "cow").reduce((s, e) => s + e.quantity, 0));
      const buffalo = round1(entries.filter(e => e.animalType === "buffalo").reduce((s, e) => s + e.quantity, 0));
      const total   = round1(cow + buffalo);
      return { ...w, cow, buffalo, total };
    });

    const totalCow     = round1(days.reduce((s, d) => s + d.cow, 0));
    const totalBuffalo = round1(days.reduce((s, d) => s + d.buffalo, 0));
    const totalAll     = round1(totalCow + totalBuffalo);
    const avgCow       = round1(totalCow / 7);
    const avgBuffalo   = round1(totalBuffalo / 7);
    const avgTotal     = round1(totalAll / 7);

    const sorted  = [...days].sort((a, b) => b.total - a.total);
    const highest = sorted[0];
    const lowest  = sorted[sorted.length - 1];

    return {
      days,
      totals: { cow: totalCow, buffalo: totalBuffalo, all: totalAll },
      highest,
      lowest,
      avgCow,
      avgBuffalo,
      avgTotal,
    };
  }, [allEntries]);

  const chartW = Math.max((screenW - 64) / 2, 260);
  const barData  = days.map(d => ({ cow: d.cow, buffalo: d.buffalo, label: d.xLabel }));
  const lineData = days.map(d => ({ total: d.total, label: d.xLabel }));

  function exportCSV() {
    const headers = ["Date", "Cow Milk (L)", "Buffalo Milk (L)", "Total (L)", "Performance"];
    const dataRows = days.map(d => [
      d.short,
      d.cow.toFixed(1),
      d.buffalo.toFixed(1),
      d.total.toFixed(1),
      d.total > 0 ? (d.total >= avgTotal ? "Above Avg" : "Below Avg") : "-",
    ]);
    dataRows.push(["Averages", avgCow.toFixed(1), avgBuffalo.toFixed(1), avgTotal.toFixed(1), ""]);
    const csv = [headers, ...dataRows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "weekly_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert("Export", "Open in browser to download as CSV.");
    }
  }

  function dayLabel(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>Weekly Report</Text>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
            Sat, Apr 18 – Fri, Apr 24
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 4 }} />

        {/* ── Summary Cards ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }} contentContainerStyle={{ paddingRight: 4 }}
        >
          {/* Cow Total */}
          <View style={{
            backgroundColor: C.card, borderRadius: 14, padding: 18,
            width: 200, marginRight: 12, elevation: 2,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
          }}>
            <Text style={{ fontSize: 12, color: C.gray500, fontWeight: "500", marginBottom: 10 }}>
              Total Cow Milk (7 Days)
            </Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: C.purple }}>{totals.cow}L</Text>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>Avg: {avgCow}L per day</Text>
          </View>

          {/* Buffalo Total */}
          <View style={{
            backgroundColor: C.card, borderRadius: 14, padding: 18,
            width: 200, marginRight: 12, elevation: 2,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
          }}>
            <Text style={{ fontSize: 12, color: C.gray500, fontWeight: "500", marginBottom: 10 }}>
              Total Buffalo Milk (7 Days)
            </Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: C.purple }}>{totals.buffalo}L</Text>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>Avg: {avgBuffalo}L per day</Text>
          </View>

          {/* Combined Total */}
          <View style={{
            backgroundColor: C.purple, borderRadius: 14, padding: 18,
            width: 200, elevation: 3,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
          }}>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500", marginBottom: 10 }}>
              Combined Total (7 Days)
            </Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: "#FFFFFF" }}>{totals.all}L</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Avg: {avgTotal}L per day</Text>
          </View>
        </ScrollView>

        {/* ── Highest / Lowest Production Day ──────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          {/* Highest */}
          <View style={{
            flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>📈</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: C.gray900 }}>Highest Production Day</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.gray500, marginBottom: 4 }}>Date</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: C.gray900, marginBottom: 14 }}>
              {dayLabel(highest.date)}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>Cow</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: C.purple }}>{highest.cow}L</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>Buffalo</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: C.purpleLight }}>{highest.buffalo}L</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: C.gray700 }}>{highest.total}L</Text>
              </View>
            </View>
          </View>

          {/* Lowest */}
          <View style={{
            flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>📉</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: C.gray900 }}>Lowest Production Day</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.gray500, marginBottom: 4 }}>Date</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: C.gray900, marginBottom: 14 }}>
              {dayLabel(lowest.date)}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>Cow</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: C.orange }}>{lowest.cow}L</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>Buffalo</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: C.orange }}>{lowest.buffalo}L</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: C.gray500, marginBottom: 2 }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: C.orange }}>{lowest.total}L</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Day-by-Day Breakdown ─────────────────────────────────────────── */}
        <View style={{
          backgroundColor: C.card, borderRadius: 14, marginBottom: 16,
          elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
          overflow: "hidden",
        }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: C.gray900 }}>Day-by-Day Breakdown</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 560 }}>
              {/* Table header */}
              <View style={{
                flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10,
                borderBottomWidth: 1, borderBottomColor: C.border,
              }}>
                {["DATE", "COW MILK", "BUFFALO MILK", "TOTAL", "PERFORMANCE"].map((h, i) => (
                  <Text key={h} style={{
                    width: i === 0 ? 130 : i === 4 ? 120 : 110,
                    fontSize: 10, fontWeight: "600", color: C.gray500,
                    letterSpacing: 0.5, textTransform: "uppercase",
                  }}>{h}</Text>
                ))}
              </View>

              {/* Data rows */}
              {days.map((d, i) => {
                const aboveAvg = d.total >= avgTotal && d.total > 0;
                const hasData  = d.total > 0;
                return (
                  <View key={d.date} style={{
                    flexDirection: "row", alignItems: "center",
                    paddingHorizontal: 16, paddingVertical: 13,
                    borderBottomWidth: 1, borderBottomColor: C.border,
                    backgroundColor: i % 2 === 0 ? C.card : "#FAFAFA",
                  }}>
                    <Text style={{ width: 130, fontSize: 13, color: C.gray700 }}>{d.short}</Text>
                    <Text style={{ width: 110, fontSize: 13, fontWeight: "500", color: C.purple }}>{d.cow.toFixed(1)}L</Text>
                    <Text style={{ width: 110, fontSize: 13, fontWeight: "500", color: C.purpleLight }}>{d.buffalo.toFixed(1)}L</Text>
                    <Text style={{ width: 110, fontSize: 13, fontWeight: "600", color: C.gray900 }}>{d.total.toFixed(1)}L</Text>
                    <View style={{ width: 120, flexDirection: "row", alignItems: "center" }}>
                      {hasData ? (
                        <>
                          <Text style={{ fontSize: 12, marginRight: 4 }}>{aboveAvg ? "📈" : "📉"}</Text>
                          <Text style={{ fontSize: 12, fontWeight: "600", color: aboveAvg ? C.green : C.red }}>
                            {aboveAvg ? "Above Avg" : "Below Avg"}
                          </Text>
                        </>
                      ) : (
                        <Text style={{ fontSize: 12, fontWeight: "600", color: C.red }}>Below Avg</Text>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* Averages row */}
              <View style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, paddingVertical: 13,
                backgroundColor: "#F5F3FF",
              }}>
                <Text style={{ width: 130, fontSize: 13, fontWeight: "700", color: C.gray900 }}>Averages</Text>
                <Text style={{ width: 110, fontSize: 13, fontWeight: "700", color: C.purple }}>{avgCow.toFixed(1)}L</Text>
                <Text style={{ width: 110, fontSize: 13, fontWeight: "700", color: C.purpleLight }}>{avgBuffalo.toFixed(1)}L</Text>
                <Text style={{ width: 110, fontSize: 13, fontWeight: "700", color: C.gray900 }}>{avgTotal.toFixed(1)}L</Text>
                <View style={{ width: 120 }} />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* ── Charts ───────────────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          {/* Bar Chart */}
          <View style={{
            flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900, marginBottom: 8 }}>
              Daily Production
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart data={barData} width={Math.max(chartW, 280)} />
            </ScrollView>
          </View>

          {/* Line Chart */}
          <View style={{
            flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: C.gray900, marginBottom: 8 }}>
              Total Production Trend
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart data={lineData} width={Math.max(chartW, 280)} />
            </ScrollView>
          </View>
        </View>

        {/* ── Export Button ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={exportCSV}
          style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: C.purple, paddingHorizontal: 20,
            paddingVertical: 12, borderRadius: 10,
            alignSelf: "flex-start", gap: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>⬇️</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Export to Excel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
