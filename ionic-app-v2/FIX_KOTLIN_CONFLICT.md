# FIX: Conflit Kotlin Stdlib

**Date**: 19 octobre 2025  
**Problème**: Duplicate class errors (kotlin-stdlib-1.8.22 vs 1.6.21)

---

## Problème Rencontré

```
Duplicate class kotlin.collections.jdk8.CollectionsJDK8Kt found in modules:
- kotlin-stdlib-1.8.22.jar (org.jetbrains.kotlin:kotlin-stdlib:1.8.22)
- kotlin-stdlib-jdk8-1.6.21.jar (org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.6.21)
```

**Cause**: Différents plugins Capacitor utilisent différentes versions de Kotlin stdlib.

---

## Solution Appliquée

**Fichiers modifiés**: 
1. `android/build.gradle` (root)
2. `android/app/build.gradle` (app module)

### 1. android/build.gradle

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
    }
    
    // Fix: Force Kotlin stdlib version to avoid duplicates
    configurations.all {
        resolutionStrategy {
            force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
        }
    }
}
```

### 2. android/app/build.gradle

```gradle
dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    // ... autres dépendances ...
}

// Fix: Force Kotlin stdlib version to resolve duplicates
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
    }
}
```

**Effet**: Force TOUS les modules (y compris cordova-android-plugins) à utiliser Kotlin 1.8.22.

---

## Étapes Suivantes

### Dans Android Studio (RECOMMANDÉ):

1. **File → Sync Project with Gradle Files**
   - Raccourci: Ctrl+Shift+O ou cliquer icône 🐘
   - Attendre "Gradle sync finished"

2. **Build → Clean Project**
   - Supprime ancien build avec conflits

3. **Build → Rebuild Project**
   - Recompile avec version Kotlin forcée
   - **Utilise le JDK intégré d'Android Studio**

4. **Run app**
   - Bouton vert ▶️

### ⚠️ NE PAS utiliser `./gradlew` en ligne de commande
**Raison**: Gradle CLI nécessite Java 21 installé séparément. Android Studio a son propre JDK embedded.

---

## Vérification

Si le build réussit, vous verrez:

```
BUILD SUCCESSFUL in Xm Ys
```

Si erreur persiste:
1. Vérifier `android/app/build.gradle` (pas de dépendances Kotlin explicites)
2. `./gradlew clean` dans terminal
3. Invalider caches: File → Invalidate Caches → Invalidate and Restart

---

## Références

- [Android Dependency Resolution](https://d.android.com/r/tools/classpath-sync-errors)
- [Kotlin Stdlib Migration](https://kotlinlang.org/docs/whatsnew17.html#stable-jdk-stdlib-variants)
- [Gradle Resolution Strategy](https://docs.gradle.org/current/userguide/dependency_resolution.html)

---

**Status**: ✅ Fix appliqué - Prêt pour rebuild
