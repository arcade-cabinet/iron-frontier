import { View } from "react-native";
import { Text } from "@/components/ui";

export function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text variant="small" className="text-red-300/70">
        {label}
      </Text>
      <Text variant="small" className="font-semibold text-red-200">
        {value}
      </Text>
    </View>
  );
}
