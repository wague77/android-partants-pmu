import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.novastudio.partantspmu",
  appName: "Partants PMU",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#ffffff",
  },
};

export default config;
