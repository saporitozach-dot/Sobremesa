# Sobremesa 🍷

*Sobremesa* (Spanish): the time spent lingering at the table after a meal — talking, not scrolling.

A React Native (Expo) app that detects when you arrive at a partner restaurant and invites you into a **phone-free dining session**. Stay present for your goal time, keep emergency contacts (and optionally the camera) available, and earn rewards.

## What's in this MVP

- **Onboarding** — explains the concept and requests location + notification permissions.
- **Geofencing engine** (`src/services/geofence.ts`) — OS-level region monitoring via `expo-location` + `expo-task-manager`. Fires a notification and an in-app "you've arrived" prompt when you enter a partner zone, even when backgrounded.
- **Zone prompt** — invites you to start a session, showing the goal, reward, and what stays available.
- **Locked Mode** (`src/screens/LockedModeScreen.tsx`) — the core experience: a session timer with a goal ring, an emergency-contacts dialer, an optional camera shortcut, and encouragement to look up. Completing the goal earns points.
- **Session complete** — celebrates the session and awards points.
- **Settings** — toggle monitoring, set the session goal (30/45/60/90 min), allow/disallow the camera, and manage emergency contacts.
- **Persistence** — points, history, settings, and contacts are stored with AsyncStorage.

## Run it

```bash
cd Sobremesa
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `i` / `a` for a simulator.

> **Tip:** Geofencing is unreliable in simulators. Use the **"Simulate arriving at a restaurant"** button on the Home screen to trigger the full enter → prompt → lock → reward flow without leaving your desk. On a physical device, the sample zones are in Bloomington, IN — edit `src/data/restaurants.ts` to drop a zone on your actual location for a real-world test.

## Architecture

```
App.tsx                     Navigation + notification config
src/
  theme.ts                  Design tokens (colors, spacing, type)
  types.ts                  Shared TypeScript models
  data/restaurants.ts       Seed partner restaurants (replace with backend)
  services/geofence.ts      Background geofencing + event bus
  context/AppContext.tsx    Global state, persistence, lock lifecycle
  components/Button.tsx     Shared button
  screens/                  Onboarding, Home, ZonePrompt, Locked,
                            SessionComplete, Settings
```

## Important: the "phone lock" reality

A normal consumer app **cannot** fully lock down another app's phone on iOS or Android. True app-blocking requires platform-restricted APIs:

- **iOS** — the [Screen Time / Family Controls framework](https://developer.apple.com/documentation/familycontrols) (`ManagedSettings`, `DeviceActivity`). This needs a special Apple entitlement, granted via an application process, and a custom native module — it does **not** work in Expo Go and requires a development build / EAS.
- **Android** — `DevicePolicyManager` (Device Admin / kiosk "lock task" mode) or a Digital Wellbeing–style accessibility service. Also requires native code and elevated permissions.

This MVP therefore models Locked Mode as a **full-screen "set your phone down" experience** with a timer and a streak/reward incentive — the same behavioral approach used by apps like Forest and One Sec. It's honest about what's enforceable today and still delivers the core habit loop.

**Recommended path to real enforcement** (post-MVP): build a development build with [EAS](https://docs.expo.dev/develop/development-builds/introduction/), add native modules wrapping `FamilyControls` (iOS) and `DevicePolicyManager` (Android), and apply for the iOS Family Controls entitlement. The restaurant-managed side becomes a lightweight web dashboard + backend that owns the partner-restaurant geofences.

## Next steps

1. Backend + auth so restaurants can self-manage their zones and rewards.
2. Map view (react-native-maps) on Home instead of a list.
3. Real reward redemption (discounts, loyalty) tied to partner restaurants.
4. Native lock modules + entitlement application (see above).
5. Social features — shared sessions for a whole table.
