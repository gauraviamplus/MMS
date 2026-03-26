import * as React from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";
import { cn } from "../../lib/utils";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-foreground">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            error && "border-destructive",
            props.editable === false && "opacity-50",
            className
          )}
          placeholderTextColor="#6b7280"
          {...props}
        />
        {error && (
          <Text className="mt-1 text-xs text-destructive">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

export { Input };
