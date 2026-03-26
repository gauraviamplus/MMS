import React from "react";
import { ScrollView, View, SafeAreaView, TouchableOpacity } from "react-native";
import { Text } from "../components/ui/Text";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { getDashboardStats, COLLECTIONS } from "../data/mockData";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <View
      className={`flex-1 rounded-xl p-4 mr-2 ${accent ? "bg-blue-600" : "bg-white border border-gray-100"}`}
      style={{ minWidth: 140, elevation: 2 }}
    >
      <Text className={`text-xs mb-1 ${accent ? "text-blue-100" : "text-gray-500"}`}>
        {label}
      </Text>
      <Text className={`text-2xl font-bold ${accent ? "text-white" : "text-gray-900"}`}>
        {value}
      </Text>
      {sub && (
        <Text className={`text-xs mt-0.5 ${accent ? "text-blue-200" : "text-gray-400"}`}>
          {sub}
        </Text>
      )}
    </View>
  );
}

const today = new Date().toISOString().split("T")[0];
const todayLabel = new Date().toLocaleDateString("mr-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function DashboardScreen() {
  const stats = getDashboardStats();
  const todayCollections = COLLECTIONS.filter((c) => c.date === today);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-5 pt-4 pb-6">
        <Text className="text-blue-200 text-sm">आजची तारीख</Text>
        <Text className="text-white text-xl font-bold mt-0.5">{todayLabel}</Text>
        <Text className="text-blue-100 text-xs mt-1">Milk Manager</Text>
      </View>

      <ScrollView
        className="-mt-3 flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Summary Cards */}
        <View className="flex-row mt-4 mb-4">
          <StatCard
            label="आजचे एकूण दूध"
            value={`${stats.todayTotalLiters.toFixed(1)} L`}
            sub={`सकाळ ${stats.todayMorningLiters.toFixed(1)}L · सायं ${stats.todayEveningLiters.toFixed(1)}L`}
            accent
          />
          <StatCard
            label="आजची रक्कम"
            value={`₹${stats.todayTotalAmount.toFixed(0)}`}
            sub="आजचे देणे"
          />
        </View>

        <View className="flex-row mb-5">
          <StatCard
            label="या महिन्यात"
            value={`${stats.monthTotalLiters.toFixed(0)} L`}
            sub="एकूण संकलन"
          />
          <StatCard
            label="सक्रिय शेतकरी"
            value={`${stats.activeFarmers}`}
            sub={`${stats.pendingPayments} payments pending`}
          />
        </View>

        <Separator className="mb-4" />

        {/* Today's Collections */}
        <Text variant="h4" className="text-gray-800 mb-3">
          आजचे संकलन
        </Text>

        {todayCollections.length === 0 ? (
          <Card>
            <CardContent>
              <Text variant="muted" className="text-center py-4">
                आज अजून संकलन नोंद नाही
              </Text>
            </CardContent>
          </Card>
        ) : (
          todayCollections.map((col) => (
            <View
              key={col.id}
              className="bg-white rounded-xl mb-2 px-4 py-3 flex-row items-center justify-between"
              style={{ elevation: 1 }}
            >
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{col.farmerName}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  Fat: {col.fat}%  · SNF: {col.snf}%  · ₹{col.rate}/L
                </Text>
              </View>
              <View className="items-end ml-3">
                <Badge variant={col.session === "morning" ? "default" : "secondary"}>
                  {col.session === "morning" ? "सकाळ" : "सायं"}
                </Badge>
                <Text className="text-base font-bold text-gray-900 mt-1">
                  {col.quantity} L
                </Text>
                <Text className="text-xs text-green-600 font-medium">
                  ₹{col.amount}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
