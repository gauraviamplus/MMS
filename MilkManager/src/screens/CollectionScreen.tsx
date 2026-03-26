import React, { useState } from "react";
import {
  ScrollView,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";
import { FARMERS, COLLECTIONS } from "../data/mockData";
import type { Session } from "../types";

const today = new Date().toISOString().split("T")[0];
const todayLabel = new Date().toLocaleDateString("mr-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Milk rate calculator: base on fat %
function calcRate(fat: number, animalType: string): number {
  if (animalType === "buffalo") return Math.round(25 + fat * 2);
  return Math.round(20 + fat * 2);
}

export default function CollectionScreen() {
  const [session, setSession] = useState<Session>("morning");
  const [selectedFarmer, setSelectedFarmer] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [fat, setFat] = useState("");
  const [snf, setSnf] = useState("");
  const [loading, setLoading] = useState(false);

  const activeFarmers = FARMERS.filter((f) => f.active);
  const selectedFarmerData = activeFarmers.find((f) => f.id === selectedFarmer);

  const fatNum = parseFloat(fat) || 0;
  const qtyNum = parseFloat(quantity) || 0;
  const rate = selectedFarmerData ? calcRate(fatNum, selectedFarmerData.animalType) : 0;
  const amount = qtyNum * rate;

  // Today's already entered collections
  const todaySessionCols = COLLECTIONS.filter(
    (c) => c.date === today && c.session === session
  );

  function handleSubmit() {
    if (!selectedFarmer) { Alert.alert("त्रुटी", "शेतकरी निवडा"); return; }
    if (!quantity || qtyNum <= 0) { Alert.alert("त्रुटी", "दूध प्रमाण भरा"); return; }
    if (!fat || fatNum <= 0) { Alert.alert("त्रुटी", "Fat % भरा"); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "यशस्वी ✓",
        `${selectedFarmerData?.name}\n${qtyNum} L · Fat ${fatNum}% · ₹${amount.toFixed(0)}`
      );
      setSelectedFarmer("");
      setQuantity("");
      setFat("");
      setSnf("");
    }, 600);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <Text variant="h3" className="text-gray-900">दूध संकलन</Text>
        <Text className="text-xs text-gray-500">{todayLabel}</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Session Toggle */}
        <View className="flex-row bg-gray-200 rounded-xl p-1 mb-5">
          {(["morning", "evening"] as Session[]).map((s) => (
            <TouchableOpacity
              key={s}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                session === s ? "bg-white" : ""
              }`}
              style={session === s ? { elevation: 2 } : undefined}
              onPress={() => setSession(s)}
            >
              <Text
                className={`font-semibold text-sm ${
                  session === s ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {s === "morning" ? "🌅  सकाळ" : "🌇  सायंकाळ"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Entry Form */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-gray-800">नवीन नोंद</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Farmer Picker */}
            <Text className="text-sm font-medium text-gray-700 mb-2">शेतकरी *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {activeFarmers.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  className={`mr-2 px-3 py-2 rounded-lg border ${
                    selectedFarmer === f.id
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-200"
                  }`}
                  onPress={() => setSelectedFarmer(f.id)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedFarmer === f.id ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {f.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Input
                  label="प्रमाण (Liter) *"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Fat %  *"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  value={fat}
                  onChangeText={setFat}
                />
              </View>
            </View>

            <Input
              label="SNF %"
              placeholder="8.5"
              keyboardType="decimal-pad"
              value={snf}
              onChangeText={setSnf}
              className="mb-4"
            />

            {/* Preview */}
            {qtyNum > 0 && fatNum > 0 && (
              <View className="bg-blue-50 rounded-xl p-4 mb-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs text-gray-500">दर (Rate)</Text>
                  <Text className="text-lg font-bold text-blue-700">₹{rate}/L</Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">प्रमाण</Text>
                  <Text className="text-lg font-bold text-gray-800">{qtyNum} L</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-500">एकूण रक्कम</Text>
                  <Text className="text-lg font-bold text-green-600">₹{amount.toFixed(0)}</Text>
                </View>
              </View>
            )}

            <Button onPress={handleSubmit} loading={loading}>
              नोंद जतन करा
            </Button>
          </CardContent>
        </Card>

        {/* Today's entries for this session */}
        <Text variant="h4" className="text-gray-700 mb-3">
          {session === "morning" ? "सकाळचे" : "सायंकाळचे"} संकलन ({todaySessionCols.length})
        </Text>

        {todaySessionCols.length === 0 ? (
          <Text variant="muted" className="text-center py-4">
            अजून नोंद नाही
          </Text>
        ) : (
          todaySessionCols.map((col) => (
            <View
              key={col.id}
              className="bg-white rounded-xl px-4 py-3 mb-2 flex-row items-center justify-between"
              style={{ elevation: 1 }}
            >
              <View>
                <Text className="font-semibold text-gray-800">{col.farmerName}</Text>
                <Text className="text-xs text-gray-500">Fat: {col.fat}%  ·  SNF: {col.snf}%</Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-gray-800">{col.quantity} L</Text>
                <Text className="text-sm text-green-600 font-medium">₹{col.amount}</Text>
              </View>
            </View>
          ))
        )}

        {/* Session total */}
        {todaySessionCols.length > 0 && (
          <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row justify-between mt-1">
            <Text className="font-semibold text-gray-700">एकूण</Text>
            <View className="items-end">
              <Text className="font-bold text-gray-900">
                {todaySessionCols.reduce((s, c) => s + c.quantity, 0).toFixed(1)} L
              </Text>
              <Text className="text-sm text-green-600 font-semibold">
                ₹{todaySessionCols.reduce((s, c) => s + c.amount, 0)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
