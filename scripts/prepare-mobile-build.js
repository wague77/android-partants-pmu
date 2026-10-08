import fs from "node:fs";
import path from "node:path";

async function prepareMobileBuild() {
  console.log("🚀 [prepare-mobile-build] Préparation des artefacts mobiles...");
  const outputPublicDir = path.resolve(".output/public");
  const outputServerEntry = path.resolve(".output/server/index.mjs");
  const distDir = path.resolve("dist");

  if (!fs.existsSync(outputPublicDir)) {
    fs.mkdirSync(outputPublicDir, { recursive: true });
  }

  let htmlContent = "";
  if (fs.existsSync(outputServerEntry)) {
    try {
      const serverModule = await import(outputServerEntry);
      const handler = serverModule.default;
      if (handler && typeof handler.fetch === "function") {
        const dummyEnv = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
        const dummyCtx = { waitUntil: () => {}, passThroughOnException: () => {} };
        const response = await handler.fetch(new Request("http://localhost/"), dummyEnv, dummyCtx);
        if (response.status === 200) {
          htmlContent = await response.text();
          console.log(`✅ [prepare-mobile-build] HTML pré-rendu généré via SSR (${htmlContent.length} octets).`);
        }
      }
    } catch (err) {
      console.warn("⚠️ [prepare-mobile-build] Rendu SSR impossible, bascule vers gabarit dynamique:", err);
    }
  }

  if (!htmlContent || htmlContent.length < 50) {
    let entryJs = "";
    let mainCss = "";
    const assetsDir = path.join(outputPublicDir, "assets");
    if (fs.existsSync(assetsDir)) {
      const fls = fs.readdirSync(assetsDir);
      entryJs = fls.find((f) => f.startsWith("index-") && f.endsWith(".js")) || "";
      mainCss = fls.find((f) => f.startsWith("styles-") && f.endsWith(".css")) || "";
    }
    const scriptTag = entryJs ? `<script type="module" src="/assets/${entryJs}"></script>` : `<script type="module" src="/src/main.tsx"></script>`;
    const cssTag = mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : "";
    htmlContent = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>Partants PMU</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    ${cssTag}
  </head>
  <body class="bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
    <div id="root"></div>
    ${scriptTag}
  </body>
</html>`;
  }

  fs.writeFileSync(path.join(outputPublicDir, "index.html"), htmlContent, "utf8");

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.cpSync(outputPublicDir, distDir, { recursive: true });
  console.log("✅ [prepare-mobile-build] Dossier dist/ synchronisé avec .output/public.");

  const androidAssetsDir = path.resolve("android/app/src/main/assets/public");
  if (fs.existsSync(path.resolve("android"))) {
    fs.mkdirSync(androidAssetsDir, { recursive: true });
    fs.cpSync(distDir, androidAssetsDir, { recursive: true });
    console.log("✅ [prepare-mobile-build] Assets Android natifs synchronisés dans android/app/src/main/assets/public.");
  }
}

prepareMobileBuild().catch((err) => {
  console.error("❌ [prepare-mobile-build] Erreur:", err);
  process.exit(1);
});
