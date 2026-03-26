import * as React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary active:opacity-90",
        destructive: "bg-destructive active:opacity-90",
        outline: "border border-input bg-background active:bg-accent",
        secondary: "bg-secondary active:opacity-80",
        ghost: "active:bg-accent",
        link: "active:opacity-70",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base",
      icon: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    { className, textClassName, variant, size, onPress, disabled, loading, children },
    ref
  ) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }), {
          "opacity-50": disabled || loading,
        })}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            className="mr-2"
            color={variant === "default" ? "#fff" : "#000"}
          />
        )}
        <Text
          className={cn(buttonTextVariants({ variant, size, className: textClassName }))}
        >
          {children}
        </Text>
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
