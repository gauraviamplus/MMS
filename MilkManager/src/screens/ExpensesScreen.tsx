import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Pencil, Trash2, Receipt } from "lucide-react-native";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";
import type { Expense, ExpenseCategory } from "../types";

const C = {
  primary:    "#7C3AED",
  bg:         "#F5F3FF",
  card:       "#FFFFFF",
  border:     "#E5E7EB",
  text:       "#1F2937",
  textSub:    "#6B7280",
  gray100:    "#F3F4F6",
  gray400:    "#9CA3AF",
  gray700:    "#374151",
  red:        "#EF4444",
  // category colours
  medicine:   "#EF4444",
  medicineBg: "#FEE2E2",
  food:       "#10B981",
  foodBg:     "#D1FAE5",
  worker:     "#F59E0B",
  workerBg:   "#FEF3C7",
};

const CATEGORIES: ExpenseCategory[] = ["medicine", "food", "worker"];

function catColor(cat: ExpenseCategory) {
  return { medicine: C.medicine, food: C.food, worker: C.worker }[cat];
}
function catBg(cat: ExpenseCategory) {
  return { medicine: C.medicineBg, food: C.foodBg, worker: C.workerBg }[cat];
}
function catEmoji(cat: ExpenseCategory) {
  return { medicine: "💊", food: "🌾", worker: "👷" }[cat];
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function fmtDay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" });
}

// ─── Expense Card ─────────────────────────────────────────────────────────────
function ExpenseCard({ expense, onEdit, onDelete }: {
  expense: Expense; onEdit: (e: Expense) => void; onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  const cat = expense.category;
  return (
    <View style={{
      backgroundColor: C.card, borderRadius: 16, marginBottom: 10,
      elevation: 2, shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
      overflow: "hidden",
    }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: 4, backgroundColor: catColor(cat) }} />
        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ backgroundColor: C.gray100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: C.textSub }}>{fmtDay(expense.date)}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: C.text }}>{fmtDate(expense.date)}</Text>
              </View>
              <View style={{ backgroundColor: catBg(cat), paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 13 }}>{catEmoji(cat)}</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: catColor(cat) }}>
                  {cat === "medicine" ? t("medicine") : cat === "food" ? t("food") : t("worker")}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "800", color: C.red }}>₹{expense.amount.toFixed(0)}</Text>
          </View>

          {expense.category === "worker" && expense.workerName ? (
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.worker, marginBottom: 4 }}>
              👷 {expense.workerName}
            </Text>
          ) : null}
          {expense.note ? (
            <Text style={{ fontSize: 12, color: C.textSub, fontStyle: "italic", marginBottom: 8 }}>{expense.note}</Text>
          ) : null}

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
            <TouchableOpacity onPress={() => onEdit(expense)}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#EDE9FE", justifyContent: "center", alignItems: "center" }}>
              <Pencil size={14} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(expense.id)}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center" }}>
              <Trash2 size={14} color={C.red} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Expense Modal ────────────────────────────────────────────────────────────
function ExpenseModal({ visible, initial, onSave, onClose }: {
  visible: boolean; initial?: Expense;
  onSave: (e: Omit<Expense, "id">) => Promise<void>; onClose: () => void;
}) {
  const { t } = useLanguage();
  const [date,       setDate]       = useState(initial?.date ?? new Date().toISOString().split("T")[0]);
  const [category,   setCategory]   = useState<ExpenseCategory>(initial?.category ?? "medicine");
  const [amount,     setAmount]     = useState(initial?.amount?.toString() ?? "");
  const [workerName, setWorkerName] = useState(initial?.workerName ?? "");
  const [note,       setNote]       = useState(initial?.note ?? "");
  const [saving,     setSaving]     = useState(false);

  React.useEffect(() => {
    if (visible) {
      setDate(initial?.date ?? new Date().toISOString().split("T")[0]);
      setCategory(initial?.category ?? "medicine");
      setAmount(initial?.amount?.toString() ?? "");
      setWorkerName(initial?.workerName ?? "");
      setNote(initial?.note ?? "");
      setSaving(false);
    }
  }, [visible, initial]);

  async function handleSave() {
    const amt = parseFloat(amount);
    if (!date)              { Alert.alert(t("error"), t("errorValidDate")); return; }
    if (isNaN(amt) || amt <= 0) { Alert.alert(t("error"), t("errorValidAmount")); return; }
    setSaving(true);
    try {
      await onSave({
        date, category, amount: amt,
        workerName: category === "worker" ? workerName.trim() || undefined : undefined,
        note: note.trim() || undefined,
      });
    } catch { Alert.alert(t("error"), t("errorSaveFailed")); }
    finally { setSaving(false); }
  }

  const catLabels: Record<ExpenseCategory, string> = {
    medicine: t("medicine"), food: t("food"), worker: t("worker"),
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <ScrollView style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          <View style={{ width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />
          <Text style={{ fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 24 }}>
            {initial ? t("editExpense") : t("newExpense")}
          </Text>

          <Text style={s.label}>{t("dateLabel")}</Text>
          <TextInput style={s.input} value={date} onChangeText={setDate}
            placeholder="2026-05-20" placeholderTextColor={C.gray400} />

          <Text style={s.label}>{t("expenseCategory")}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: "center",
                  flexDirection: "row", justifyContent: "center", gap: 6,
                  backgroundColor: category === cat ? catColor(cat) : C.gray100,
                  borderWidth: 2, borderColor: category === cat ? catColor(cat) : "transparent",
                }}>
                <Text style={{ fontSize: 16 }}>{catEmoji(cat)}</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: category === cat ? "#fff" : C.gray700 }}>
                  {catLabels[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {category === "worker" && (
            <>
              <Text style={s.label}>{t("workerName")}</Text>
              <TextInput style={s.input} value={workerName} onChangeText={setWorkerName}
                placeholder="e.g. Raju" placeholderTextColor={C.gray400} />
            </>
          )}

          <Text style={s.label}>{t("expenseAmount")}</Text>
          <TextInput style={s.input} value={amount} onChangeText={setAmount}
            keyboardType="decimal-pad" placeholder="500" placeholderTextColor={C.gray400} />

          <Text style={s.label}>{t("expenseNote")}</Text>
          <TextInput style={[s.input, { marginBottom: 24 }]} value={note} onChangeText={setNote}
            placeholder="e.g. Vaccination" placeholderTextColor={C.gray400} />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={onClose}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: C.border, alignItems: "center" }}>
              <Text style={{ color: C.gray700, fontWeight: "700", fontSize: 15 }}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: saving ? C.gray400 : C.primary, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>{saving ? t("saving") : t("save")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, total, med, food, worker }: {
  label: string; total: number; med: number; food: number; worker: number;
}) {
  const { t } = useLanguage();
  return (
    <View style={{
      flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14,
      elevation: 3, shadowColor: "#7C3AED",
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8,
    }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: C.textSub, marginBottom: 6 }}>{label}</Text>
      <Text style={{ fontSize: 22, fontWeight: "800", color: C.red, marginBottom: 10 }}>₹{total.toFixed(0)}</Text>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, color: C.medicine }}>💊 {t("medicine")}</Text>
          <Text style={{ fontSize: 11, fontWeight: "700", color: C.medicine }}>₹{med.toFixed(0)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, color: C.food }}>🌾 {t("food")}</Text>
          <Text style={{ fontSize: 11, fontWeight: "700", color: C.food }}>₹{food.toFixed(0)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, color: C.worker }}>👷 {t("worker")}</Text>
          <Text style={{ fontSize: 11, fontWeight: "700", color: C.worker }}>₹{worker.toFixed(0)}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ExpensesScreen() {
  const { expenses, addExpense, updateExpense, removeExpense, loading } = useData();
  const { t } = useLanguage();
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | undefined>();

  const TODAY = new Date().toISOString().split("T")[0];
  const WEEK_START = new Date(Date.now() - 6 * 86_400_000).toISOString().split("T")[0];
  const MONTH_START = TODAY.slice(0, 7); // YYYY-MM

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  const summary = useMemo(() => {
    function calc(list: Expense[]) {
      return {
        total:  list.reduce((s, e) => s + e.amount, 0),
        med:    list.filter(e => e.category === "medicine").reduce((s, e) => s + e.amount, 0),
        food:   list.filter(e => e.category === "food").reduce((s, e) => s + e.amount, 0),
        worker: list.filter(e => e.category === "worker").reduce((s, e) => s + e.amount, 0),
      };
    }
    const weekly  = expenses.filter(e => e.date >= WEEK_START && e.date <= TODAY);
    const monthly = expenses.filter(e => e.date.startsWith(MONTH_START));
    return { week: calc(weekly), month: calc(monthly) };
  }, [expenses, TODAY, WEEK_START, MONTH_START]);

  async function handleSave(data: Omit<Expense, "id">) {
    if (editTarget) await updateExpense(editTarget.id, data);
    else await addExpense(data);
    setModalOpen(false); setEditTarget(undefined);
  }

  async function handleDelete(id: string) {
    const doDelete = async () => {
      try { await removeExpense(id); }
      catch { Alert.alert(t("error"), t("errorSaveFailed")); }
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
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>{t("expenses")}</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {expenses.length} {t("totalRecords")}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setEditTarget(undefined); setModalOpen(true); }}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, gap: 6 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{t("newExpense")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <SummaryCard label={t("weeklyExpenses")}
            total={summary.week.total} med={summary.week.med} food={summary.week.food} worker={summary.week.worker} />
          <SummaryCard label={t("monthlyExpenses")}
            total={summary.month.total} med={summary.month.med} food={summary.month.food} worker={summary.month.worker} />
        </View>

        {/* Expense List */}
        {sorted.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Receipt size={56} color={C.gray400} />
            <Text style={{ fontSize: 18, fontWeight: "800", color: C.text, marginTop: 16, marginBottom: 6 }}>{t("noExpensesYet")}</Text>
            <Text style={{ fontSize: 14, color: C.textSub }}>{t("tapAddExpense")}</Text>
          </View>
        ) : (
          sorted.map(expense => (
            <ExpenseCard key={expense.id} expense={expense}
              onEdit={e => { setEditTarget(e); setModalOpen(true); }}
              onDelete={handleDelete} />
          ))
        )}
      </ScrollView>

      <ExpenseModal visible={modalOpen} initial={editTarget}
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
