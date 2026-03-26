import { useColorScheme } from "react-native";
import { LIGHT_THEME, DARK_THEME } from "../constants/theme";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  return { theme, isDark, colorScheme };
}
