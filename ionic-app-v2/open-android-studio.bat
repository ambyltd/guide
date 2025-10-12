@echo off
REM Script de lancement Android Studio pour ionic-app-v2
REM Ce script ouvre le projet Android dans Android Studio

echo.
echo ================================================
echo    Lancement Android Studio
echo    Projet: ionic-app-v2
echo ================================================
echo.

REM Chemins possibles d'Android Studio
set STUDIO1="C:\Program Files\Android\Android Studio\bin\studio64.exe"
set STUDIO2="C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe"
set STUDIO3="%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"

REM Chemin du projet Android
set PROJECT_PATH=%~dp0android

echo [1/3] Verification de l'installation d'Android Studio...

if exist %STUDIO1% (
    echo [OK] Android Studio trouve: %STUDIO1%
    start "" %STUDIO1% %PROJECT_PATH%
    goto :success
)

if exist %STUDIO2% (
    echo [OK] Android Studio trouve: %STUDIO2%
    start "" %STUDIO2% %PROJECT_PATH%
    goto :success
)

if exist %STUDIO3% (
    echo [OK] Android Studio trouve: %STUDIO3%
    start "" %STUDIO3% %PROJECT_PATH%
    goto :success
)

REM Si Android Studio n'est pas trouvé
echo.
echo [ERREUR] Android Studio n'a pas ete trouve aux emplacements standards.
echo.
echo Solutions:
echo 1. Lancer Android Studio manuellement depuis le menu Demarrer
echo 2. File ^> Open ^> Selectionner: %PROJECT_PATH%
echo.
echo Ou installer Android Studio:
echo https://developer.android.com/studio
echo.
pause
exit /b 1

:success
echo.
echo [2/3] Android Studio est en cours de lancement...
echo [3/3] Le projet sera ouvert dans quelques secondes
echo.
echo ================================================
echo    Instructions:
echo ================================================
echo.
echo 1. Attendre Gradle Sync (~30s)
echo 2. Build ^> Clean Project
echo 3. Build ^> Rebuild Project (~1-2 min)
echo 4. Connecter device Android via USB
echo 5. Run ^> Run 'app' (bouton vert play)
echo.
echo Voir INSTALLATION_ANDROID_GUIDE.md pour details
echo.
echo Appuyez sur une touche pour fermer...
pause >nul
