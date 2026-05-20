import React, { useState } from "react";
import { View } from "react-native";
import MonthlyScreen from "./MonthlyScreen";
import YearlyScreen  from "./YearlyScreen";

type Tab = "monthly" | "yearly";

export default function ReportTabScreen() {
  const [active, setActive] = useState<Tab>("monthly");

  return (
    <View style={{ flex: 1 }}>
      {active === "monthly"
        ? <MonthlyScreen activeTab={active} onTabChange={setActive} />
        : <YearlyScreen  activeTab={active} onTabChange={setActive} />}
    </View>
  );
}
