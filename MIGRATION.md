# Iron Frontier - Expo to Ionic Angular Migration

**Date:** January 27, 2026
**Migration Type:** Expo/React → Ionic Angular + Capacitor + Electron
**Target:** Single root app with web, Android, iOS, and desktop builds

## Summary

The project is moving from a single Expo/React app to a single Ionic Angular app powered by Capacitor. Electron is included as a first-class platform target. Babylon.js now runs directly in Angular (no Reactylon), with a minimal Babylon scene wired to validate the pipeline.

## Changes Made

### 1. **New Structure Created**
- Root Ionic Angular app scaffolded in `src/`
- Capacitor platforms added: `android/`, `ios/`, `electron/`
- Electron configured via `@capacitor-community/electron`
- Legacy Expo artifacts moved to `legacy/expo-root/`
- Legacy React game source moved to `legacy/react-src/`

### 2. **Configuration Updates**
- Added `angular.json`, `ionic.config.json`, and Angular tsconfigs
- Added `capacitor.config.ts` for unified platform config
- Updated `.gitignore` for Ionic/Capacitor outputs
- Updated `README.md` quick start for Ionic workflows

### 3. **Dependencies**
- Added Angular 20, Ionic 8, Capacitor 8
- Added Babylon.js, Rapier, Anime.js
- Added `@capacitor-community/electron`
- Removed Expo/React Native dependencies from root

### 4. **Babylon.js Integration**
- A basic Babylon engine/scene is created in `src/app/game/game.page.ts`
- Uses Angular `NgZone` to keep render loop outside change detection

## Notes

- The requested app id `com.arcade-cabinet.iron-frontier` is invalid for Android/iOS bundle identifiers (dashes are not allowed). The config currently uses `com.arcade_cabinet.iron_frontier` to keep mobile builds functional.

## Next Steps

- Port the full game HUD, panels, and gameplay flow into Angular/Ionic components
- Migrate Zustand store access into Angular services
- Replace placeholder Babylon scene with the full scene graph and asset pipeline
- Update CI workflows for Ionic/Capacitor build targets
