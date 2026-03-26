import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const Separator = React.forwardRef<React.ElementRef<typeof View>, SeparatorProps>(
  ({ orientation = "horizontal", className }, ref) => (
    <View
      ref={ref}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
    />
  )
);

Separator.displayName = "Separator";

export { Separator };
