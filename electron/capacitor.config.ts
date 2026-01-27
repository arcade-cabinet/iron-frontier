import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Dashes are invalid for Android/iOS bundle identifiers; use underscores for compatibility.
  appId: "com.arcade_cabinet.iron_frontier",
  appName: "Iron Frontier",
  webDir: "www",
  bundledWebRuntime: false
};

export default config;
