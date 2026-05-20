import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Pencil, Trash2 } from "lucide-react-native";
import { useData } from "../context/DataContext";
import type { Animal } from "../data/animalsData";

const C = {
  primary:     "#7C3AED",
  primaryDark: "#5B21B6",
  primaryBg:   "#EDE9FE",
  cow:         "#7C3AED",
  buffalo:     "#4F46E5",
  buffaloBg:   "#E0E7FF",
  bg:          "#F5F3FF",
  card:        "#FFFFFF",
  border:      "#E5E7EB",
  text:        "#1F2937",
  textSub:     "#6B7280",
  green:       "#10B981",
  gray100:     "#F3F4F6",
  gray400:     "#9CA3AF",
  gray700:     "#374151",
};

const todayStr = new Date().toISOString().split("T")[0];
const sevenAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().split("T")[0];
function r1(n: number) { return Math.round(n * 10) / 10; }

// ─── Animal Card ──────────────────────────────────────────────────────────────
function AnimalCard({ animal, onEdit, onDelete }: {
  animal: Animal; onEdit: (a: Animal) => void; onDelete: (id: string) => void;
}) {
  const { entries } = useData();
  const stats = useMemo(() => {
    const all   = entries.filter(e => e.animalName === animal.name);
    const last7 = all.filter(e => e.date >= sevenAgo && e.date <= todayStr);
    const total = r1(all.reduce((s, e) => s + e.quantity, 0));
    const count = all.length;
    const avg   = count > 0 ? r1(total / count) : 0;
    const l7    = r1(last7.reduce((s, e) => s + e.quantity, 0));
    return { total, count, avg, l7 };
  }, [entries, animal.name]);

  const isCow   = animal.type === "cow";
  const accent  = isCow ? C.cow : C.buffalo;
  const accentBg = isCow ? C.primaryBg : C.buffaloBg;

  return (
    <View style={{
      backgroundColor: C.card, borderRadius: 18, overflow: "hidden",
      elevation: 3, shadowColor: accent,
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8,
    }}>
      {/* Card top accent strip */}
      <View style={{ height: 5, backgroundColor: accent }} />

      <View style={{ padding: 16 }}>
        {/* Header row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: accentBg, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 22 }}>{isCow ? "🐄" : "🐃"}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: C.text }}>{animal.name}</Text>
              <Text style={{ fontSize: 12, color: C.textSub }}>{animal.age} yrs old</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <TouchableOpacity onPress={() => onEdit(animal)}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryBg, justifyContent: "center", alignItems: "center" }}>
              <Pencil size={14} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(animal.id)}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center" }}>
              <Trash2 size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats grid */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <StatPill label="Total" value={`${stats.total}L`} />
          <StatPill label="Entries" value={`${stats.count}`} />
          <StatPill label="Avg/Entry" value={`${stats.avg}L`} />
        </View>

        {/* Last 7 days highlight */}
        <View style={{ marginTop: 10, backgroundColor: accentBg, borderRadius: 10, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: accent, fontWeight: "600" }}>Last 7 Days</Text>
          <Text style={{ fontSize: 18, fontWeight: "800", color: accent }}>{stats.l7}L</Text>
        </View>
      </View>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.gray100, borderRadius: 10, padding: 8, alignItems: "center" }}>
      <Text style={{ fontSize: 10, color: C.textSub, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "700", color: C.text }}>{value}</Text>
    </View>
  );
}

// ─── Animal Modal ─────────────────────────────────────────────────────────────
function AnimalModal({ visible, initial, onSave, onClose }: {
  visible: boolean; initial?: Animal;
  onSave: (a: Omit<Animal, "id">) => Promise<void>; onClose: () => void;
}) {
  const [name,   setName]   = useState(initial?.name ?? "");
  const [type,   setType]   = useState<"cow" | "buffalo">(initial?.type ?? "cow");
  const [age,    setAge]    = useState(initial?.age?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? ""); setType(initial?.type ?? "cow");
      setAge(initial?.age?.toString() ?? ""); setSaving(false);
    }
  }, [visible, initial]);

  async function handleSave() {
    const ageNum = parseInt(age, 10);
    if (!name.trim())                 { Alert.alert("Error", "Enter animal name."); return; }
    if (isNaN(ageNum) || ageNum <= 0) { Alert.alert("Error", "Enter valid age."); return; }
    setSaving(true);
    try { await onSave({ name: name.trim(), type, age: ageNum }); }
    catch { Alert.alert("Error", "Failed to save. Is the backend running?"); }
    finally { setSaving(false); }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 }}>
          {/* Handle bar */}
          <View style={{ width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />

          <Text style={{ fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 24 }}>
            {initial ? "Edit Animal" : "Add New Animal"}
          </Text>

          <Text style={s.label}>Animal Name</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Bella" placeholderTextColor={C.gray400} />

          <Text style={s.label}>Type</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
            {(["cow", "buffalo"] as const).map(t => (
              <TouchableOpacity key={t} onPress={() => setType(t)}
                style={{
                  flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center",
                  backgroundColor: type === t ? C.primary : C.gray100,
                  borderWidth: 2, borderColor: type === t ? C.primary : "transparent",
                }}>
                <Text style={{ fontSize: 20, marginBottom: 2 }}>{t === "cow" ? "🐄" : "🐃"}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: type === t ? "#fff" : C.gray700, textTransform: "capitalize" }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Age (years)</Text>
          <TextInput style={s.input} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="e.g. 4" placeholderTextColor={C.gray400} />

          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <TouchableOpacity onPress={onClose}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: C.border, alignItems: "center" }}>
              <Text style={{ color: C.gray700, fontWeight: "700", fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: saving ? C.gray400 : C.primary, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AnimalsScreen() {
  const { animals, addAnimal, updateAnimal, removeAnimal, loading } = useData();
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Animal | undefined>();

  const cows      = animals.filter(a => a.type === "cow");
  const buffaloes = animals.filter(a => a.type === "buffalo");

  async function handleSave(data: Omit<Animal, "id">) {
    if (editTarget) await updateAnimal(editTarget.id, data);
    else await addAnimal(data);
    setModalOpen(false); setEditTarget(undefined);
  }

  function handleEdit(a: Animal) { setEditTarget(a); setModalOpen(true); }

  async function handleDelete(id: string) {
    const name = animals.find(a => a.id === id)?.name;
    const doDelete = async () => {
      try { await removeAnimal(id); }
      catch { Alert.alert("Error", "Failed to delete."); }
    };
    if (Platform.OS === "web") {
      // @ts-ignore
      if (window.confirm(`Remove ${name}?`)) doDelete();
    } else {
      Alert.alert("Delete Animal", `Remove ${name}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    }
  }

  function renderGrid(list: Animal[]) {
    const rows: Animal[][] = [];
    for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
    return rows.map((row, ri) => (
      <View key={ri} style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        {row.map(a => <View key={a.id} style={{ flex: 1 }}><AnimalCard animal={a} onEdit={handleEdit} onDelete={handleDelete} /></View>)}
        {row.length === 1 && <View style={{ flex: 1 }} />}
      </View>
    ));
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
      {/* ── Purple Header ── */}
      <SafeAreaView style={{ backgroundColor: C.bg }} edges={["top"]}>
        <View style={{
          backgroundColor: C.primary, borderRadius: 24, marginHorizontal: 12, marginTop: 8,
          overflow: "hidden", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
          elevation: 8, shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
        }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>Animals</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {animals.length} animal{animals.length !== 1 ? "s" : ""} registered
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setEditTarget(undefined); setModalOpen(true); }}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, gap: 6 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>Add Animal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {cows.length > 0 && (
          <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 4, height: 18, backgroundColor: C.cow, borderRadius: 2, marginRight: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.text }}>Cows</Text>
              <View style={{ marginLeft: 8, backgroundColor: C.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: C.cow }}>{cows.length}</Text>
              </View>
            </View>
            {renderGrid(cows)}
          </View>
        )}

        {buffaloes.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 4, height: 18, backgroundColor: C.buffalo, borderRadius: 2, marginRight: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.text }}>Buffaloes</Text>
              <View style={{ marginLeft: 8, backgroundColor: C.buffaloBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: C.buffalo }}>{buffaloes.length}</Text>
              </View>
            </View>
            {renderGrid(buffaloes)}
          </View>
        )}

        {animals.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🐄</Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: C.text, marginBottom: 6 }}>No Animals Yet</Text>
            <Text style={{ fontSize: 14, color: C.textSub, textAlign: "center" }}>Tap "Add Animal" to register your first animal</Text>
          </View>
        )}
      </ScrollView>

      <AnimalModal visible={modalOpen} initial={editTarget} onSave={handleSave}
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
