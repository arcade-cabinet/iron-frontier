/**
 * Confirmation dialog for buy/sell actions and empty state component.
 */

import * as React from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import type { ConfirmationDialog } from "./helpers.ts";

// =============================================================================
// EmptyState
// =============================================================================

export function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <View className="items-center py-12">
      <Text className="mb-1 text-sm text-frontier-dust/30">{message}</Text>
      <Text className="text-xs text-frontier-dust/20">{hint}</Text>
    </View>
  );
}

// =============================================================================
// ConfirmDialog
// =============================================================================

export function ConfirmDialog({
  dialog,
  onCancel,
}: {
  dialog: NonNullable<ConfirmationDialog>;
  onCancel: () => void;
}) {
  const isBuy = dialog.type === "buy";

  return (
    <Modal transparent visible onRequestClose={onCancel}>
      <View className="absolute inset-0 flex-1 items-center justify-center bg-black/60">
        <Pressable className="absolute inset-0" onPress={onCancel} />
        <Animated.View
          entering={Platform.OS !== "web" ? SlideInDown.duration(200) : FadeIn.duration(150)}
          exiting={Platform.OS !== "web" ? SlideOutDown.duration(150) : FadeOut.duration(100)}
          className="mx-6 w-full max-w-sm rounded-xl border border-frontier-leather/40 bg-frontier-gunmetal p-5"
        >
          <Pressable>
            <Text variant="subheading" className="mb-2 text-center text-frontier-dust">
              {isBuy ? "Confirm Purchase" : "Confirm Sale"}
            </Text>
            <Text className="mb-4 text-center text-sm text-frontier-dust/70">
              {isBuy
                ? `Buy ${dialog.itemName} for ${dialog.price} gold?`
                : `Sell ${dialog.itemName} for ${dialog.price} gold?`}
            </Text>
            <View className="flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] flex-1"
                onPress={onCancel}
              >
                <Text className="text-sm text-frontier-dust/70">Cancel</Text>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={cn("min-h-[44px] flex-1", isBuy ? "bg-green-700" : "bg-amber-700")}
                onPress={() => {
                  dialog.onConfirm();
                  onCancel();
                }}
              >
                <Text className="text-sm font-medium text-white">{isBuy ? "Buy" : "Sell"}</Text>
              </Button>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
