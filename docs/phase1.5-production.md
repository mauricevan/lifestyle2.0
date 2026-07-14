# Phase 1.5 — Standalone build & achtergrondmonitoring

Doel: RPM draaien **zonder Metro/PC**, met betrouwbaardere hartslagmeting als het scherm uit staat.

## Wat is nieuw

| Onderdeel | Beschrijving |
|---|---|
| **Preview-build** | Standalone APK via EAS (`preview` profile) — geen dev client, geen QR-code |
| **Foreground-melding** | Vaste Android-melding zolang monitoring actief is |
| **BLE-reconnect** | Herverbinding bij app naar voor-/achtergrond |
| **Batterijbeheer** | Instellingen → uitleg voor Realme/OPPO + link naar systeeminstellingen |

## Preview-build maken

Vanuit de monorepo-root:

```bash
cd apps/mobile
npx eas build --profile preview --platform android --non-interactive
```

Of via script:

```bash
corepack pnpm --filter @rpm/mobile build:android:preview
```

Na de build: download de APK van [expo.dev](https://expo.dev) en installeer op je telefoon. **Geen PC nodig** om de app te gebruiken.

## Verschil development vs preview

| | Development | Preview |
|---|---|---|
| Metro nodig | Ja | Nee |
| Dev menu (shake) | Ja | Nee |
| BLE + Health Connect | Ja | Ja |
| Doel | Bouwen & debuggen | Testen als eindgebruiker |

## Achtergrond op Android

1. Bij onboarding voltooid start **live monitoring** automatisch.
2. Android toont melding **"RPM actief"** — dit houdt BLE-monitoring langer actief.
3. Ga naar **Systeem → Batterijbeheer instellen** en zet RPM op **Geen beperkingen** (Realme: Batterij → App-batterijbeheer).

> Volledige foreground service via `react-native-ble-plx` (`isBackgroundEnabled: true`) + ongoing notification. Op agressieve OEM-skinnen (Realme, Xiaomi) blijft batterij-whitelist essentieel.

## Testchecklist (preview APK)

- [ ] App opent zonder Metro
- [ ] Band koppelen werkt
- [ ] Hartslag zichtbaar op meter
- [ ] Scherm vergrendelen 2–5 min → hartslag blijft updaten (of reconnect na ontgrendelen)
- [ ] Melding "RPM actief" zichtbaar tijdens monitoring
- [ ] Batterijbeheer ingesteld op geen beperkingen

## Production-build (later, Play Store)

```bash
cd apps/mobile
npx eas build --profile production --platform android --non-interactive
```

Levert een **AAB** op voor Google Play. Vereist nog: privacybeleid, Health Connect-declaratie, interne testtrack.

## Gerelateerde docs

- [EAS Dev Build](./eas-dev-build.md) — development client + Metro
- [Phase 2 Companion](./phase2-companion-architecture.md) — toekomstige architectuur
