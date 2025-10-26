@echo off
echo 🚀 BUILD ANDROID APK DEBUG

echo.
echo 📦 1/4 Building web assets...
call npm run build
if %errorlevel% neq 0 goto :error

echo.
echo 🔄 2/4 Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 goto :error

echo.
echo 🏗️  3/4 Building APK...
cd android
call gradlew assembleDebug
cd ..
if %errorlevel% neq 0 goto :error

echo.
echo 📋 4/4 Copying APK...
copy android\app\build\outputs\apk\debug\app-debug.apk audioguide-debug.apk

echo.
echo ✅ BUILD SUCCESS!
echo APK location: audioguide-debug.apk
echo.
echo Install on device:
echo   adb install -r audioguide-debug.apk
echo.

set /p install="Install on connected device now? (y/n): "
if /i "%install%"=="y" (
    echo.
    echo 📱 Installing on device...
    adb install -r audioguide-debug.apk
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Installation success!
        echo.
        echo Launch app:
        echo   adb shell am start -n io.ionic.starter/.MainActivity
    ) else (
        echo.
        echo ❌ Installation failed! Check device connection.
    )
)
goto :end

:error
echo.
echo ❌ BUILD FAILED!
pause
exit /b 1

:end
pause
