import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react-native";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";
import type { DailyEntry } from "../types";

const C = {
  primary:    "#7C3AED",
  cowBg:      "#EDE9FE",
  cowText:    "#7C3AED",
  bufBg:      "#E0E7FF",
  bufText:    "#4F46E5",
  green:      "#10B981",
  bg:         "#F5F3FF",
  card:       "#FFFFFF",
  border:     "#E5E7EB",
  text:       "#1F2937",
  textSub:    "#6B7280",
  gray100:    "#F3F4F6",
  gray400:    "#9CA3AF",
  gray700:    "#374151",
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function fmtDay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" });
}

// ─── Entry Card ───────────────────────────────────────────────────────────────
function EntryCard({ entry, onEdit, onDelete }: {
  entry: DailyEntry; onEdit: (e: DailyEntry) => void; onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  const isCow = entry.animalType === "cow";
  const accent = isCow ? C.primary : "#4F46E5";
  return (
    <View style={{
      backgroundColor: C.card, borderRadius: 16, marginBottom: 10,
      elevation: 2, shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
      overflow: "hidden",
    }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: 4, backgroundColor: accent }} />
        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ backgroundColor: C.gray100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: C.textSub }}>{fmtDay(entry.date)}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: C.text }}>{fmtDate(entry.date)}</Text>
              </View>
              <View style={{ backgroundColor: isCow ? C.cowBg : C.bufBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: isCow ? C.cowText : C.bufText }}>
                  {isCow ? `🐄 ${t("cow")}` : `🐃 ${t("buffalo")}`}
                </Text>
              </View>
              <View style={{
                backgroundColor: entry.session === "morning" ? "#FEF3C7" : "#EEF2FF",
                paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
              }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: entry.session === "morning" ? "#D97706" : "#6366F1" }}>
                  {entry.session === "morning" ? `🌅 ${t("morning")}` : `🌙 ${t("evening")}`}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "800", color: C.green }}>₹{entry.totalAmount.toFixed(0)}</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: "800", color: C.text }}>
                {entry.quantity.toFixed(1)}L
              </Text>
              <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
                ₹{entry.rate.toFixed(0)}/L
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => onEdit(entry)}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.cowBg, justifyContent: "center", alignItems: "center" }}>
                <Pencil size={14} color={C.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(entry.id)}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center" }}>
                <Trash2 size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Entry Modal ──────────────────────────────────────────────────────────────
function EntryModal({ visible, initial, onSave, onClose }: {
  visible: boolean; initial?: DailyEntry;
  onSave: (e: Omit<DailyEntry, "id">) => Promise<void>; onClose: () => void;
}) {
  const { t } = useLanguage();
  const [date,       setDate]      = useState(initial?.date ?? new Date().toISOString().split("T")[0]);
  const [animalType, setAnimalType] = useState<"cow" | "buffalo">(initial?.animalType ?? "cow");
  const [session,    setSession]   = useState<"morning" | "evening">(initial?.session ?? "morning");
  const [quantity,   setQuantity]  = useState(initial?.quantity?.toString() ?? "");
  const [rate,       setRate]      = useState(initial?.rate?.toString() ?? "35");
  const [notes,      setNotes]     = useState(initial?.notes ?? "");
  const [saving,     setSaving]    = useState(false);

  React.useEffect(() => {
    if (visible) {
      setDate(initial?.date ?? new Date().toISOString().split("T")[0]);
      setAnimalType(initial?.animalType ?? "cow");
      setSession(initial?.session ?? "morning");
      setQuantity(initial?.quantity?.toString() ?? "");
      setRate(initial?.rate?.toString() ?? "35");
      setNotes(initial?.notes ?? "");
      setSaving(false);
    }
  }, [visible, initial]);

  function handleTypeChange(type: "cow" | "buffalo") {
    setAnimalType(type);
    setRate(type === "cow" ? "35" : "30");
  }

  async function handleSave() {
    const qty = parseFloat(quantity), r = parseFloat(rate);
    if (!date || isNaN(qty) || qty <= 0) { Alert.alert(t("error"), t("errorValidDate")); return; }
    if (isNaN(r) || r <= 0)              { Alert.alert(t("error"), t("errorValidRate")); return; }
    setSaving(true);
    try {
      await onSave({
        date,
        animalType,
        animalName: animalType,
        session,
        quantity: qty,
        rate: r,
        totalAmount: Math.round(qty * r * 100) / 100,
        notes: notes.trim() || undefined,
      });
    } catch { Alert.alert(t("error"), t("errorSaveFailed")); }
    finally { setSaving(false); }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <ScrollView style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          <View style={{ width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />
          <Text style={{ fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 24 }}>
            {initial ? t("editEntry") : t("newEntry")}
          </Text>

          <Text style={s.label}>{t("dateLabel")}</Text>
          <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="2026-05-20" placeholderTextColor={C.gray400} />

          <Text style={s.label}>{t("type")}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            {(["cow", "buffalo"] as const).map(tp => (
              <TouchableOpacity key={tp} onPress={() => handleTypeChange(tp)}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: "center",
                  flexDirection: "row", justifyContent: "center", gap: 6,
                  backgroundColor: animalType === tp ? (tp === "cow" ? C.primary : "#4F46E5") : C.gray100,
                  borderWidth: 2, borderColor: animalType === tp ? (tp === "cow" ? C.primary : "#4F46E5") : "transparent",
                }}>
                <Text style={{ fontSize: 18 }}>{tp === "cow" ? "🐄" : "🐃"}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: animalType === tp ? "#fff" : C.gray700 }}>
                  {tp === "cow" ? t("cow") : t("buffalo")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>{t("session")}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            {(["morning", "evening"] as const).map(sess => (
              <TouchableOpacity key={sess} onPress={() => setSession(sess)}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: "center",
                  flexDirection: "row", justifyContent: "center", gap: 6,
                  backgroundColor: session === sess ? (sess === "morning" ? "#F59E0B" : "#6366F1") : C.gray100,
                  borderWidth: 2, borderColor: session === sess ? (sess === "morning" ? "#F59E0B" : "#6366F1") : "transparent",
                }}>
                <Text style={{ fontSize: 18 }}>{sess === "morning" ? "🌅" : "🌙"}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: session === sess ? "#fff" : C.gray700 }}>
                  {sess === "morning" ? t("morning") : t("evening")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{t("rateLabel")}</Text>
              <TextInput style={s.input} value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="35" placeholderTextColor={C.gray400} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{t("quantityLabel")}</Text>
              <TextInput style={s.input} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="10.5" placeholderTextColor={C.gray400} />
            </View>
          </View>

          {quantity && rate && !isNaN(parseFloat(quantity)) && !isNaN(parseFloat(rate)) && (
            <View style={{ backgroundColor: "#F0FDF4", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: C.textSub, fontSize: 13 }}>{t("totalAmount")}</Text>
              <Text style={{ color: C.green, fontWeight: "800", fontSize: 16 }}>
                ₹{(parseFloat(quantity) * parseFloat(rate)).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={onClose}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: C.border, alignItems: "center" }}>
              <Text style={{ color: C.gray700, fontWeight: "700", fontSize: 15 }}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: saving ? C.gray400 : C.primary, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>{saving ? t("saving") : t("saveEntry")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DailyEntryScreen() {
  const { entries, addEntry, updateEntry, removeEntry, loading } = useData();
  const { t } = useLanguage();
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<DailyEntry | undefined>();

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const totalToday = entries.filter(e => e.date === new Date().toISOString().split("T")[0])
    .reduce((s, e) => s + e.quantity, 0);

  async function handleSave(data: Omit<DailyEntry, "id">) {
    if (editTarget) await updateEntry(editTarget.id, data);
    else await addEntry(data);
    setModalOpen(false); setEditTarget(undefined);
  }

  async function handleDelete(id: string) {
    const doDelete = async () => {
      try { await removeEntry(id); }
      catch { Alert.alert(t("error"), t("errorDeleteEntry")); }
    };
    if (Platform.OS === "web") {
      // @ts-ignore
      if (window.confirm(t("deleteConfirm"))) doDelete();
    } else {
      Alert.alert(t("deleteEntry"), t("deleteConfirm"), [
        { text: t("cancel"), style: "cancel" },
        { text: t("delete"), style: "destructive", onPress: doDelete },
      ]);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.primary, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ backgroundColor: C.bg }} edges={["top"]}>
        <View style={{
          backgroundColor: C.primary, borderRadius: 24, marginHorizontal: 12, marginTop: 8,
          overflow: "hidden", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
          elevation: 8, shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
        }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>{t("dailyEntries")}</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {t("today")}: {totalToday.toFixed(1)}L · {entries.length} {t("totalRecords")}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setEditTarget(undefined); setModalOpen(true); }}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, gap: 6 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{t("newEntry")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <ClipboardList size={56} color={C.gray400} />
            <Text style={{ fontSize: 18, fontWeight: "800", color: C.text, marginTop: 16, marginBottom: 6 }}>{t("noEntriesYet")}</Text>
            <Text style={{ fontSize: 14, color: C.textSub }}>{t("tapNewEntry")}</Text>
          </View>
        ) : (
          sorted.map(entry => (
            <EntryCard key={entry.id} entry={entry}
              onEdit={e => { setEditTarget(e); setModalOpen(true); }}
              onDelete={handleDelete} />
          ))
        )}
      </ScrollView>

      <EntryModal visible={modalOpen} initial={editTarget}
        onSave={handleSave}
        onClose={() => { setModalOpen(false); setEditTarget(undefined); }} />
    </View>
  );
}

const s = {
  label: { fontSize: 13, color: "#6B7280", marginBottom: 6, fontWeight: "600" as const },
  input: {
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#1F2937", marginBottom: 16, backgroundColor: "#FAFAFA",
  },
};
