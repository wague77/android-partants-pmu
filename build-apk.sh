#!/usr/bin/env bash
# Script de compilation locale 100% fonctionnel pour Android APK et AAB Play Store
set -e

echo "🚀 ==============================================="
echo "    NOVA Studio - Compilation Android APK & AAB"
echo "==============================================="

# 1. Compiler les assets web
echo "📦 1/4 - Construction des fichiers web..."
npm install || true
npm run build

# 2. Copier les assets dans le projet Android
echo "📂 2/4 - Copie des assets dans android/app/src/main/assets/public..."
mkdir -p android/app/src/main/assets/public
cp -r dist/* android/app/src/main/assets/public/ || cp -r build/* android/app/src/main/assets/public/ || true

# 3. Compiler l'APK Android (Installation directe)
echo "🤖 3/4 - Compilation de l'APK (assembleRelease)..."
cd android
chmod +x ./gradlew || true
./gradlew assembleRelease --stacktrace

# 4. Compiler l'AAB Google Play Store
echo "💎 4/4 - Compilation de l'AAB pour Google Play Store (bundleRelease)..."
./gradlew bundleRelease --stacktrace

echo ""
echo "✅ SUCCÈS ! Vos fichiers sont prêts :"
echo "📱 Fichier APK (installation directe) : android/app/build/outputs/apk/release/*.apk"
echo "🌐 Fichier AAB (Google Play Store)    : android/app/build/outputs/bundle/release/*.aab"
echo "==============================================="
