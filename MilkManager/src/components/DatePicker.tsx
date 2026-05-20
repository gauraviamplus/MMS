import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import { Calendar } from "react-native-calendars";

const PRIMARY = "#7C3AED";
const LIGHT   = "#8B5CF6";

interface Props {
  value: string;           // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
}

export default function DatePicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);

  function fmt(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  function onDayPress(day: { dateString: string }) {
    onChange(day.dateString);
    setOpen(false);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {label && (
        <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, fontWeight: "600" }}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1.5, borderColor: open ? PRIMARY : "#E5E7EB",
          borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
          marginBottom: 16, backgroundColor: "#FAFAFA",
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        }}>
        <Text style={{ fontSize: 15, color: value ? "#1F2937" : "#9CA3AF" }}>
          {value ? fmt(value) : "Select date"}
        </Text>
        <Text style={{ fontSize: 18 }}>📅</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={{
              backgroundColor: "#fff", borderRadius: 20, overflow: "hidden",
              width: Platform.OS === "web" ? 340 : 320,
              shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
            }}>
              {/* Header */}
              <View style={{ backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Select Date</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 20, fontWeight: "300" }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Calendar
                current={value || today}
                onDayPress={onDayPress}
                markedDates={{
                  [value]: { selected: true, selectedColor: PRIMARY },
                  [today]: value !== today
                    ? { marked: true, dotColor: LIGHT }
                    : { selected: true, selectedColor: PRIMARY },
                }}
                theme={{
                  backgroundColor:           "#ffffff",
                  calendarBackground:        "#ffffff",
                  selectedDayBackgroundColor: PRIMARY,
                  selectedDayTextColor:      "#ffffff",
                  todayTextColor:            PRIMARY,
                  dayTextColor:              "#1F2937",
                  textDisabledColor:         "#D1D5DB",
                  dotColor:                  PRIMARY,
                  selectedDotColor:          "#ffffff",
                  arrowColor:                PRIMARY,
                  monthTextColor:            "#1F2937",
                  textDayFontWeight:         "500" as const,
                  textMonthFontWeight:       "700" as const,
                  textDayHeaderFontWeight:   "600" as const,
                  textDayFontSize:           14,
                  textMonthFontSize:         16,
                  textDayHeaderFontSize:     12,
                }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
