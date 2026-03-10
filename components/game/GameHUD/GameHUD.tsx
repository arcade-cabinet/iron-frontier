import { View } from "react-native";
import { BottomLeftPanel, BottomRightPanel } from "./BottomPanels.tsx";
import { TopLeftPanel, TopRightPanel } from "./TopPanels.tsx";

export function GameHUD() {
  return (
    <View className="absolute inset-0" pointerEvents="box-none" accessibilityRole="none">
      <TopLeftPanel />
      <TopRightPanel />
      <BottomLeftPanel />
      <BottomRightPanel />
    </View>
  );
}
