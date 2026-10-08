@echo off
echo ===============================================
echo     NOVA Studio - Compilation Android APK ^& AAB
echo ===============================================

echo [1/4] Construction des fichiers web...
call npm install
call npm run build

echo [2/4] Copie des assets dans le projet Android...
mkdir android\app\src\main\assets\public 2>nul
xcopy /s /e /y dist\* android\app\src\main\assets\public\

echo [3/4] Compilation de l'APK autonome...
cd android
call gradlew.bat assembleRelease

echo [4/4] Compilation de l'AAB Google Play Store...
call gradlew.bat bundleRelease

echo.
echo ===============================================
echo SUCCES ! Vos fichiers sont prets :
echo APK : android\app\build\outputs\apk\release\
echo AAB : android\app\build\outputs\bundle\release\
echo ===============================================
pause
