# Guide de Publication Google Play Store & Compilation Android (APK & AAB)

---

## ⚠️ RAPPEL TRÈS IMPORTANT SUR L'INSTALLATION DES FICHIERS APK ET AAB

> **Pourquoi un fichier APK téléchargé directement depuis un navigateur web ne s'installe pas sur un smartphone Android ?**
> 
> Le système d'exploitation **Android** intègre un mécanisme de sécurité strict : chaque paquet `.apk` doit être compilé par les outils officiels de Google (**Android SDK**, **AAPT2**, **D8**) pour transformer les classes Java en **bytecode Dalvik DEX binaire** et être scellé avec une signature cryptographique **APK Signature Scheme v2/v3** via `apksigner`.
> 
> Un navigateur web seul ne peut pas exécuter le compilateur natif Google. C'est pourquoi un fichier brut non compilé par le SDK provoque l'erreur classique :
> `"Application non installée : le package semble non valide"` ou `"Erreur lors de l'analyse du package"`.

---

## 🚀 COMMENT OBTENIR VOS FICHIERS APK ET AAB 100% FONCTIONNELS EN 2 MINUTES

### Option 1 (La plus simple & Gratuite) : Compilation Cloud Automatique via GitHub Actions
Vous n'avez **aucun logiciel à installer** !
1. Dans NOVA Studio, cliquez sur le bouton **« Pousser sur GitHub »**.
2. Rendez-vous sur votre dépôt GitHub dans l'onglet **Actions**.
3. Le workflow **Build Android APK and AAB** compile automatiquement votre projet sur les serveurs de GitHub équipés de Java 17 et Android SDK 34.
4. Téléchargez directement les fichiers dans la section *Artifacts* :
   * **`app-release-apk`** : Le véritable fichier `.apk` certifié prêt à installer sur votre téléphone !
   * **`app-release-aab`** : Le bundle `.aab` certifié prêt à être importé dans la Google Play Console !

---

### Option 2 : Compilation Locale en 1 Clic sur votre Ordinateur
Si vous avez le JDK Java ou Android Studio installé :
1. Décompressez le pack ZIP téléchargé.
2. Double-cliquez ou lancez dans le terminal :
   * **Sur Windows** : Double-cliquez sur `build-apk.bat`
   * **Sur macOS / Linux** : Ouvrez un terminal et tapez `./build-apk.sh`
3. Le script compile automatiquement votre projet et dépose :
   * L'APK dans : `android/app/build/outputs/apk/release/app-release.apk`
   * L'AAB dans : `android/app/build/outputs/bundle/release/app-release.aab`

---

### Option 3 : Test Immédiat sur Smartphone (Sans compilation)
* Grâce à la prise en charge **PWA / WebAPK** incluse dans le projet, vous pouvez ouvrir votre application dans le navigateur Chrome de votre smartphone Android et appuyer sur **« Ajouter à l'écran d'accueil »** ou **« Installer l'application »**.
* L'application s'installe instantanément avec votre **icône personnalisée**, votre **écran de démarrage (Splash Screen)** et votre **couleur de fond**, exactement comme une application native !

---

## 📋 Informations de votre Application
* **Nom** : Partants PMU
* **Package ID Play Store** : `com.novastudio.partantspmu`
* **Version** : 1.0.0 (Code 1)
* **Couleur du thème** : `#0f172a`
* **Couleur du fond** : `#ffffff`
* **Couleur de la barre d'état** : `#0f172a`
* **Couleur de l'icône** : `#4f46e5`
