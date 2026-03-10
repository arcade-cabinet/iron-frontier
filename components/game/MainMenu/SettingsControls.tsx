import { Pressable, View } from "react-native";
import { Text } from "@/components/ui";
import { cn } from "@/lib/utils";

export function SliderRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="small" className="text-foreground">
          {label}
        </Text>
        <Text variant="caption" className="text-muted-foreground">
          {pct}%
        </Text>
      </View>
      <View className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <Pressable
          className="absolute inset-0"
          onPress={(e) => {
            const newVal = Math.min(1, Math.max(0, Math.round((value + 0.1) * 10) / 10));
            if (newVal > 1) {
              onValueChange(0);
            } else {
              onValueChange(newVal);
            }
          }}
        >
          <View className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </Pressable>
      </View>
    </View>
  );
}

export function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-md px-1 py-2 active:bg-muted/30"
      onPress={onToggle}
    >
      <View className="flex-1">
        <Text variant="small" className="text-foreground">
          {label}
        </Text>
        {description && (
          <Text variant="caption" className="text-muted-foreground">
            {description}
          </Text>
        )}
      </View>
      <View
        className={cn(
          "h-6 w-11 rounded-full border",
          value ? "border-primary bg-primary" : "border-border bg-muted",
        )}
      >
        <View
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm",
            value ? "ml-[20px]" : "ml-[1px]",
          )}
          style={{ marginTop: 1 }}
        />
      </View>
    </Pressable>
  );
}
