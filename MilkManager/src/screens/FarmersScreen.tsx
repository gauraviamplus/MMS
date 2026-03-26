import React, { useState } from "react";
import {
  ScrollView,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Text } from "../components/ui/Text";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Separator } from "../components/ui/Separator";
import { FARMERS } from "../data/mockData";
import type { Farmer, AnimalType } from "../types";

const ANIMAL_LABELS: Record<AnimalType, string> = {
  cow: "गाय",
  buffalo: "म्हैस",
  both: "दोन्ही",
};

const ANIMAL_COLORS: Record<AnimalType, string> = {
  cow: "default",
  buffalo: "secondary",
  both: "outline",
};

function FarmerCard({ farmer }: { farmer: Farmer }) {
  const initials = farmer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      className="bg-white rounded-xl px-4 py-3 mb-2 flex-row items-center"
      style={{ elevation: 1 }}
    >
      {/* Avatar */}
      <View className="w-11 h-11 rounded-full bg-blue-100 items-center justify-center mr-3">
        <Text className="text-blue-700 font-bold text-sm">{initials}</Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="font-semibold text-gray-800">{farmer.name}</Text>
          {!farmer.active && (
            <Badge variant="destructive">Inactive</Badge>
          )}
        </View>
        <Text className="text-xs text-gray-500 mt-0.5">{farmer.phone}</Text>
        <Text className="text-xs text-gray-400">{farmer.address}</Text>
      </View>

      {/* Animal type */}
      <View className="items-end">
        <Badge variant={ANIMAL_COLORS[farmer.animalType] as any}>
          {ANIMAL_LABELS[farmer.animalType]}
        </Badge>
        <Text className="text-xs text-gray-400 mt-1">ID: {farmer.id}</Text>
      </View>
    </View>
  );
}

export default function FarmersScreen() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Add Farmer Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [animalType, setAnimalType] = useState<AnimalType>("cow");

  const filtered = FARMERS.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search)
  );

  function handleAdd() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("त्रुटी", "नाव आणि मोबाईल नंबर आवश्यक आहे");
      return;
    }
    Alert.alert("यशस्वी", `${name} शेतकरी जोडला गेला!`);
    setShowModal(false);
    setName(""); setPhone(""); setAddress(""); setAnimalType("cow");
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
        <View>
          <Text variant="h3" className="text-gray-900">शेतकरी</Text>
          <Text className="text-xs text-gray-500">{FARMERS.filter(f => f.active).length} सक्रिय शेतकरी</Text>
        </View>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={() => setShowModal(true)}
        >
          <Text className="text-white font-semibold text-sm">+ नवीन</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-4 pt-3 pb-2">
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800"
          placeholder="नाव किंवा मोबाईल शोधा..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Text variant="muted" className="text-center py-8">
            कोणताही शेतकरी सापडला नाही
          </Text>
        ) : (
          filtered.map((f) => <FarmerCard key={f.id} farmer={f} />)
        )}
      </ScrollView>

      {/* Add Farmer Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text variant="h4" className="text-gray-900">नवीन शेतकरी</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-gray-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <Separator className="mb-4" />

            <Input
              label="पूर्ण नाव *"
              placeholder="शेतकऱ्याचे नाव"
              value={name}
              onChangeText={setName}
              className="mb-3"
            />
            <Input
              label="मोबाईल नंबर *"
              placeholder="9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              className="mb-3"
            />
            <Input
              label="पत्ता"
              placeholder="गाव, तालुका"
              value={address}
              onChangeText={setAddress}
              className="mb-4"
            />

            {/* Animal Type */}
            <Text className="text-sm font-medium text-gray-700 mb-2">जनावर प्रकार</Text>
            <View className="flex-row gap-2 mb-5">
              {(["cow", "buffalo", "both"] as AnimalType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 py-2 rounded-lg border items-center ${
                    animalType === type
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-200"
                  }`}
                  onPress={() => setAnimalType(type)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      animalType === type ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {ANIMAL_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button onPress={handleAdd}>शेतकरी जोडा</Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
