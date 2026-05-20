import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";

const C = {
  purple:     "#7C3AED",
  green:      "#16A34A",
  red:        "#DC2626",
  orange:     "#EA580C",
  blue:       "#2563EB",
  bg:         "#F3F4F6",
  card:       "#FFFFFF",
  border:     "#E5E7EB",
  text:       "#1F2937",
  textSub:    "#6B7280",
  gray100:    "#F3F4F6",
};

function round1(n: number) { return Math.round(n * 10) / 10; }
function round2(n: number) { return Math.round(n * 100) / 100; }

const NOW = new Date();

export default function ReportsScreen() {
  const { entries, expenses } = useData();
  const { t } = useLanguage();

  const [year,  setYear]  = useState(NOW.getFullYear());
  const [month, setMonth] = useState(NOW.getMonth()); // 0-indexed

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = year === NOW.getFullYear() && month === NOW.getMonth();
  const end = isCurrentMonth
    ? NOW.toISOString().split("T")[0]
    : `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const monthEntries  = useMemo(() => entries.filter(e => e.date >= start && e.date <= end), [entries, start, end]);
  const monthExpenses = useMemo(() => expenses.filter(e => e.date >= start && e.date <= end), [expenses, start, end]);

  const stats = useMemo(() => {
    const cowEntries  = monthEntries.filter(e => e.animalType === "cow");
    const bufEntries  = monthEntries.filter(e => e.animalType === "buffalo");
    const totalCow    = round1(cowEntries.reduce((s, e) => s + e.quantity, 0));
    const totalBuf    = round1(bufEntries.reduce((s, e) => s + e.quantity, 0));
    const totalMilk   = round1(totalCow + totalBuf);
    const totalAmount = round2(monthEntries.reduce((s, e) => s + e.totalAmount, 0));
    const avgRate     = monthEntries.length > 0
      ? round2(monthEntries.reduce((s, e) => s + e.rate, 0) / monthEntries.length)
      : 0;

    const totalExpenses = round2(monthExpenses.reduce((s, e) => s + e.amount, 0));
    const netIncome     = round2(totalAmount - totalExpenses);

    const expByCategory: Record<string, number> = {};
    monthExpenses.forEach(e => {
      expByCategory[e.category] = round2((expByCategory[e.category] ?? 0) + e.amount);
    });

    const morningEntries = monthEntries.filter(e => e.session === "morning");
    const eveningEntries = monthEntries.filter(e => e.session === "evening");
    const morningTotal   = round1(morningEntries.reduce((s, e) => s + e.quantity, 0));
    const eveningTotal   = round1(eveningEntries.reduce((s, e) => s + e.quantity, 0));

    return { totalCow, totalBuf, totalMilk, totalAmount, avgRate, totalExpenses, netIncome, expByCategory, morningTotal, eveningTotal };
  }, [monthEntries, monthExpenses]);

  function exportCSV() {
    const rows: string[][] = [
      ["Date", "Animal", "Type", "Session", "Quantity (L)", "Rate", "Amount (₹)"],
      ...monthEntries.map(e => [e.date, e.animalName, e.animalType, e.session, e.quantity.toFixed(1), e.rate.toFixed(2), e.totalAmount.toFixed(2)]),
      [],
      ["--- Expenses ---"],
      ["Date", "Category", "Amount", "Note"],
      ...monthExpenses.map(e => [e.date, e.category, e.amount.toFixed(2), e.note ?? ""]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href  = url; link.setAttribute("download", `report_${start.slice(0, 7)}.csv`);
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
    } else {
      Alert.alert("Export", "Open in browser to download.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ backgroundColor: C.bg }} edges={["top"]}>
        <View style={{
          backgroundColor: C.purple, borderRadius: 24, marginHorizontal: 12, marginTop: 8,
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
          elevation: 8, shadowColor: C.purple,
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>Monthly Report</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{monthLabel}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TouchableOpacity onPress={prevMonth} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextMonth} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Top summary cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ paddingRight: 4 }}>
          {[
            { label: "Total Milk",    value: `${stats.totalMilk}L`,      color: C.purple, sub: `${monthEntries.length} entries` },
            { label: "Milk Income",   value: `₹${stats.totalAmount}`,    color: C.green,  sub: `Avg ₹${stats.avgRate}/L` },
            { label: "Expenses",      value: `₹${stats.totalExpenses}`,  color: C.red,    sub: `${monthExpenses.length} records` },
            { label: "Net Income",    value: `₹${stats.netIncome}`,      color: stats.netIncome >= 0 ? C.green : C.red, sub: "Income - Expenses" },
          ].map(({ label, value, color, sub }) => (
            <View key={label} style={{ backgroundColor: C.card, borderRadius: 14, padding: 18, width: 170, marginRight: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
              <Text style={{ fontSize: 12, color: C.textSub, fontWeight: "500", marginBottom: 8 }}>{label}</Text>
              <Text style={{ fontSize: 26, fontWeight: "800", color }}>{value}</Text>
              <Text style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>{sub}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Milk breakdown */}
        <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 14 }}>Milk Breakdown</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[
              { label: "🐄 Cow",       value: `${stats.totalCow}L`,    color: C.purple },
              { label: "🐃 Buffalo",   value: `${stats.totalBuf}L`,    color: "#4F46E5" },
              { label: "🌅 Morning",   value: `${stats.morningTotal}L`, color: C.orange },
              { label: "🌙 Evening",   value: `${stats.eveningTotal}L`, color: "#6366F1" },
            ].map(({ label, value, color }) => (
              <View key={label} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>{label}</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color }}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expenses by category */}
        {Object.keys(stats.expByCategory).length > 0 && (
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 14 }}>Expenses by Category</Text>
            {Object.entries(stats.expByCategory).map(([cat, amt]) => (
              <View key={cat} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>
                    {cat === "medicine" ? "💊" : cat === "food" ? "🌾" : cat === "worker" ? "👷" : "📦"}
                  </Text>
                  <Text style={{ fontSize: 14, color: C.text, textTransform: "capitalize" }}>{cat}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: C.red }}>₹{amt}</Text>
              </View>
            ))}
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.text }}>Total</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: C.red }}>₹{stats.totalExpenses}</Text>
            </View>
          </View>
        )}

        {/* Entry list */}
        {monthEntries.length > 0 && (
          <View style={{ backgroundColor: C.card, borderRadius: 14, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, overflow: "hidden" }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: C.text }}>All Entries ({monthEntries.length})</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 520 }}>
                <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                  {["Date", "Animal", "Session", "Qty (L)", "Rate", "Amount"].map((h, i) => (
                    <Text key={h} style={{ width: [100, 80, 80, 80, 70, 90][i], fontSize: 10, fontWeight: "700", color: C.textSub }}>{h}</Text>
                  ))}
                </View>
                {monthEntries.map((e, i) => (
                  <View key={e.id} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: i % 2 === 0 ? C.card : "#FAFAFA" }}>
                    <Text style={{ width: 100, fontSize: 12, color: C.textSub }}>{e.date}</Text>
                    <Text style={{ width: 80,  fontSize: 12, color: C.text }}>{e.animalType === "cow" ? "🐄" : "🐃"} {e.animalName}</Text>
                    <Text style={{ width: 80,  fontSize: 12, color: C.textSub }}>{e.session === "morning" ? "🌅" : "🌙"}</Text>
                    <Text style={{ width: 80,  fontSize: 13, fontWeight: "600", color: C.purple }}>{e.quantity.toFixed(1)}L</Text>
                    <Text style={{ width: 70,  fontSize: 12, color: C.textSub }}>₹{e.rate}</Text>
                    <Text style={{ width: 90,  fontSize: 13, fontWeight: "700", color: C.green }}>₹{e.totalAmount.toFixed(0)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {monthEntries.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 40 }}>📊</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.text, marginTop: 12 }}>No entries this month</Text>
            <Text style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>Add entries to see your report</Text>
          </View>
        )}

        <TouchableOpacity onPress={exportCSV} style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.purple, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignSelf: "flex-start", gap: 8 }}>
          <Text style={{ fontSize: 16 }}>⬇️</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Export CSV</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
