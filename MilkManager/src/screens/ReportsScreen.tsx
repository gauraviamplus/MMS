import React, { useState } from "react";
import { ScrollView, View, SafeAreaView, TouchableOpacity } from "react-native";
import { Text } from "../components/ui/Text";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { COLLECTIONS, PAYMENTS, FARMERS, getDashboardStats } from "../data/mockData";

type Tab = "summary" | "payments";

const stats = getDashboardStats();

function SummaryTab() {
  // Group collections by farmer
  const farmerMap: Record<string, { name: string; liters: number; amount: number }> = {};
  COLLECTIONS.forEach((c) => {
    if (!farmerMap[c.farmerId]) {
      farmerMap[c.farmerId] = { name: c.farmerName, liters: 0, amount: 0 };
    }
    farmerMap[c.farmerId].liters += c.quantity;
    farmerMap[c.farmerId].amount += c.amount;
  });

  const rows = Object.entries(farmerMap).sort((a, b) => b[1].liters - a[1].liters);

  return (
    <View>
      {/* Month Overview */}
      <View className="flex-row mb-4 gap-3">
        <View className="flex-1 bg-blue-600 rounded-xl p-4">
          <Text className="text-blue-100 text-xs">एकूण संकलन</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {stats.monthTotalLiters.toFixed(0)} L
          </Text>
        </View>
        <View className="flex-1 bg-green-600 rounded-xl p-4">
          <Text className="text-green-100 text-xs">एकूण रक्कम</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            ₹{stats.monthTotalAmount.toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Per-farmer breakdown */}
      <Text variant="h4" className="text-gray-700 mb-3">शेतकरी-निहाय</Text>
      {rows.map(([farmerId, data]) => {
        const farmer = FARMERS.find((f) => f.id === farmerId);
        const avgFat =
          COLLECTIONS.filter((c) => c.farmerId === farmerId).reduce(
            (s, c) => s + c.fat, 0
          ) / COLLECTIONS.filter((c) => c.farmerId === farmerId).length;

        return (
          <View
            key={farmerId}
            className="bg-white rounded-xl px-4 py-3 mb-2 flex-row items-center"
            style={{ elevation: 1 }}
          >
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">{data.name}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                सरासरी Fat: {avgFat.toFixed(1)}%
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-gray-800">{data.liters.toFixed(1)} L</Text>
              <Text className="text-sm text-green-600 font-semibold">₹{data.amount}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PaymentsTab() {
  const statusConfig = {
    paid:    { label: "दिले",    color: "default" as const,     bg: "bg-green-50",  text: "text-green-700" },
    partial: { label: "आंशिक",  color: "secondary" as const,   bg: "bg-yellow-50", text: "text-yellow-700" },
    pending: { label: "बाकी",   color: "destructive" as const, bg: "bg-red-50",    text: "text-red-700" },
  };

  const totalPending = PAYMENTS.filter((p) => p.status !== "paid").reduce(
    (s, p) => s + (p.totalAmount - p.paidAmount), 0
  );

  return (
    <View>
      {/* Pending alert */}
      {totalPending > 0 && (
        <View className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between">
          <View>
            <Text className="font-semibold text-orange-800">एकूण थकबाकी</Text>
            <Text className="text-xs text-orange-600">{PAYMENTS.filter(p => p.status !== "paid").length} payments pending</Text>
          </View>
          <Text className="text-xl font-bold text-orange-700">₹{totalPending}</Text>
        </View>
      )}

      {PAYMENTS.map((p) => {
        const cfg = statusConfig[p.status];
        const remaining = p.totalAmount - p.paidAmount;
        return (
          <View
            key={p.id}
            className={`rounded-xl px-4 py-3 mb-2 ${cfg.bg}`}
            style={{ elevation: 1 }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{p.farmerName}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {p.fromDate} ते {p.toDate}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {p.totalLiters} L · ₹{p.totalAmount}
                </Text>
              </View>
              <View className="items-end">
                <Badge variant={cfg.color}>{cfg.label}</Badge>
                {p.status !== "paid" && (
                  <Text className={`text-base font-bold mt-1 ${cfg.text}`}>
                    ₹{remaining} बाकी
                  </Text>
                )}
                {p.status === "paid" && (
                  <Text className="text-xs text-green-600 mt-1">✓ {p.paidAt}</Text>
                )}
              </View>
            </View>
            {p.status === "partial" && (
              <>
                <Separator className="my-2" />
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">दिले: ₹{p.paidAmount}</Text>
                  <Text className="text-xs text-orange-600">बाकी: ₹{remaining}</Text>
                </View>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function ReportsScreen() {
  const [tab, setTab] = useState<Tab>("summary");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <Text variant="h3" className="text-gray-900">अहवाल</Text>
        <Text className="text-xs text-gray-500">मार्च 2026</Text>
      </View>

      {/* Tab Toggle */}
      <View className="flex-row bg-gray-200 rounded-xl mx-4 mt-4 mb-2 p-1">
        {(["summary", "payments"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-2.5 rounded-lg items-center ${tab === t ? "bg-white" : ""}`}
            style={tab === t ? { elevation: 2 } : undefined}
            onPress={() => setTab(t)}
          >
            <Text
              className={`font-semibold text-sm ${tab === t ? "text-blue-600" : "text-gray-500"}`}
            >
              {t === "summary" ? "📊  सारांश" : "💰  पेमेंट"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "summary" ? <SummaryTab /> : <PaymentsTab />}
      </ScrollView>
    </SafeAreaView>
  );
}
