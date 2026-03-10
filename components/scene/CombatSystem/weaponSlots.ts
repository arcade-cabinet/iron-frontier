export function getWeaponSlots(
  inventory: Array<{ id: string; itemId: string; type: string }>,
): (string | null)[] {
  const weaponItems = inventory.filter((i) => i.type === "weapon");
  const slots: (string | null)[] = [null, null, null, null, null];
  for (let i = 0; i < Math.min(5, weaponItems.length); i++) {
    slots[i] = weaponItems[i].id;
  }
  return slots;
}
