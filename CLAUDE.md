# CLAUDE.md — Sobremesa

Read this before touching anything. It encodes how to work on this project at a high standard.

## What Sobremesa is

A React Native (Expo SDK 54) app that gets people off their phones while dining out. Geofences detect arrival at a partner restaurant → user is invited into a phone-free session → completing the goal time earns per-restaurant stamps → enough stamps unlock a voucher (restaurant-funded reward, 30-day expiry). Two-sided: diners get presence + perks, restaurants get engaged tables and loyalty.

The name is the point: *sobremesa* = lingering at the table after a meal, talking, not scrolling. Every product decision should serve that feeling — warm, calm, unhurried. Never gamify in a way that pulls attention back to the screen.

## Architecture (read before assuming)

- `App.tsx` — navigation + notification config
- `src/context/AppContext.tsx` — single source of truth: auth, settings, stamps, sessions, vouchers, persistence (AsyncStorage, key `sobremesa.v1`), lock lifecycle. All state flows through `useApp()`.
- `src/services/geofence.ts` — background region monitoring (`expo-location` + `expo-task-manager`) + event bus. `simulateZoneEnter` exists because geofencing is unreliable in simulators — keep the simulate path working.
- `src/data/restaurants.ts` — seed partner data; placeholder for a future backend. Don't build features that assume it's real infrastructure.
- `src/theme.ts` — design tokens. `src/screens/` + `src/components/` — UI.

## Non-negotiable standards

1. **Read before you write.** Never edit a file you haven't read in this session. Never assert what the code does without checking.
2. **Verify.** Run `npm run typecheck` after any TS change. If you can't run it, say so explicitly — don't imply it passed.
3. **Honesty about the lock.** A consumer app cannot force-lock a phone. Locked Mode is a commitment device (timer + incentives), like Forest/One Sec. Real enforcement needs iOS FamilyControls entitlement / Android DevicePolicyManager via an EAS dev build. Never write copy, code comments, or pitch material claiming the app "locks" or "blocks" the phone. Say "phone-down session."
4. **Safety paths stay open.** Emergency-contact dialing and (if enabled) the camera must remain reachable from Locked Mode in every state, including edge cases you introduce. Any change to `LockedModeScreen` gets re-checked against this.
5. **Design tokens only.** No hard-coded colors, font names, spacing, or radii in screens/components — import from `src/theme.ts` (and `src/theme/typography.ts`). Fraunces = editorial headers, DM Sans = UI.
6. **State discipline.** New persistent state goes through `AppContext`'s `PersistedState` + `persist()` pattern with a hydration default, not new ad-hoc AsyncStorage keys.
7. **Expo Go compatibility.** Don't add native modules or config-plugin dependencies casually — the MVP must keep running in Expo Go. Flag anything requiring a dev build before adding it.
8. **Demo auth is fake.** Sign-in/verify (`123456` code) is scaffolding. Don't harden it in place; when a backend lands, replace it. Never store real credentials.
9. **Scope control.** Do what was asked. Propose adjacent improvements in prose; don't sneak them into diffs.
10. **When uncertain, say so.** A precise "I don't know, here's how to find out" beats a confident guess. No invented file paths, APIs, or metrics — this applies to business analysis too: label estimates as estimates and show the assumption.

## Working style expected of the agent

- Plan multi-file changes before editing; state the plan in one short paragraph, then execute.
- Small, coherent diffs. Match existing patterns (functional components, `useCallback`, StyleSheet-at-bottom, named exports for components).
- Business/strategy asks: be specific and quantitative, cite sources for external claims, present options with trade-offs, and leave the final opinion to Zach.
- Writing product copy: warm, plain, a little literary. No hustle-speak, no emoji in-app.

## Current gaps (agreed backlog, in rough order)

1. Backend + auth (restaurants self-manage zones/rewards) — replaces `restaurants.ts` seed data and fake verify.
2. Voucher redemption integrity — redemption is currently client-side and trust-based; needs server validation or staff-facing confirm.
3. Session integrity — timer runs even if the phone is used; needs app-state/screen-off heuristics before rewards carry real money.
4. Map view on Home; real reward redemption flow with partners; native lock modules + entitlement application; shared table sessions.
