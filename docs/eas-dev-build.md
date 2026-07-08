# EAS Dev Build — RPM Mobile

HealthKit en Health Connect werken **niet** in Expo Go. Je hebt een **custom dev client** nodig via EAS Build.

## Vereisten

- [Expo-account](https://expo.dev/signup) (gratis tier volstaat voor dev builds)
- **Android:** geen extra account nodig (APK via internal distribution)
- **iOS device:** Apple Developer Program ($99/jaar) voor installatie op fysiek toestel
- **iOS simulator:** profile `development-simulator` (geen Apple Developer nodig, maar beperkte HealthKit)

## Eenmalige setup

Voer alles uit vanuit de **monorepo-root** (belangrijk voor pnpm workspace):

```bash
cd /home/mau/Desktop/Projecs/lifestyle2.0
npx pnpm install
```

### 1. Login bij Expo

```bash
cd apps/mobile
npx eas login
```

### 2. Koppel project aan EAS

```bash
npx eas init
```

Kies **Create new project** → slug `rpm`. Dit voegt `extra.eas.projectId` toe aan `app.json`.

### 3. Supabase anon key als EAS secret

De `.env` wordt niet meegestuurd naar EAS. Zet de anon key als secret:

```bash
npx eas env:create \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "jouw-sb_publishable_key_hier" \
  --visibility sensitive \
  --environment development \
  --environment preview \
  --environment production
```

`EXPO_PUBLIC_*` mag **niet** `--visibility secret` — gebruik `sensitive` of `plaintext` (Expo-weergave in de gebouwde app).

`EXPO_PUBLIC_SUPABASE_URL` staat al in `eas.json` (base profile).

## Builds starten

### Android (aanbevolen om mee te beginnen)

```bash
cd apps/mobile
npx eas build --profile development --platform android
```

Na de build: scan QR-code of download APK → installeer op je telefoon.

### iOS (fysiek device)

```bash
npx eas build --profile development --platform ios
```

Vereist Apple Developer-account. Registreer je device via `eas device:create` indien gevraagd.

### iOS Simulator (zonder Apple Developer)

```bash
npx eas build --profile development-simulator --platform ios
```

Installeer het `.tar.gz`-artifact in Simulator. HealthKit is beperkt — app valt terug op mock data.

## Dev client gebruiken

Na installatie van de dev build:

```bash
cd apps/mobile
npx expo start --dev-client
```

Open de **RPM** app op je telefoon (niet Expo Go) en scan de QR-code.

## Build profiles

| Profile | Doel |
|---------|------|
| `development` | Dev client, APK (Android) / device (iOS) |
| `development-simulator` | Dev client voor iOS Simulator |
| `preview` | Internal test zonder dev menu |
| `production` | App Store / Play Store |

## Monorepo-notities

- Git root moet **`lifestyle2.0/`** zijn (niet `apps/mobile/`)
- `pnpm-lock.yaml` en `pnpm-workspace.yaml` moeten gecommit zijn
- `@rpm/*` packages worden via workspace opgelost tijdens EAS build
- `eas-build-pre-install: corepack enable` staat in root `package.json` (monorepo — niet alleen `apps/mobile`)

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| EAS detecteert yarn i.p.v. pnpm | Build vanuit root-git; check `pnpm-lock.yaml` niet in `.gitignore` |
| Supabase leeg na build | `eas env:list` — anon key secret aanwezig? |
| Health Connect niet beschikbaar | Android 9+ met Health Connect app geïnstalleerd |
| HealthKit permission denied | Dev build op **fysiek** iOS device, niet Expo Go |
