import type * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

type SeparatorProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    orientation?: "horizontal" | "vertical";
  };

function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <View
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
