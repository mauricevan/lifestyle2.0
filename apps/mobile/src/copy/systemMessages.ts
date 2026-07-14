/**
 * Centralized system copy — flight-engine tone only.
 */

export const systemMessages = {
  disclaimerTitle: "Belangrijke mededeling",
  disclaimerBody:
    "RPM is geen medisch hulpmiddel en stelt geen diagnoses. Het systeem ondersteunt energiemanagement op basis van sensordata.",
  disclaimerAccept: "Begrepen — systeem starten",

  onboardingWearableTitle: "Wearable koppelen",
  onboardingWearableBody:
    "RPM leest hartslag direct van je band via Bluetooth. Stappen en slaap komen via Health Connect.",
  onboardingWearableConnect: "Toegang verlenen",

  bleCloseWahoo:
    "Sluit de Wahoo-app volledig af voordat je koppelt — de band kan maar aan één app tegelijk.",
  bleScanning: "Band zoeken…",
  bleScanAgain: "Opnieuw zoeken",
  bleTapToConnect: "Tik om te koppelen",
  bleConnecting: "Verbinden en hartslag controleren…",
  bleNoDevices:
    "Geen band gevonden. Zet de band aan, maak contact vochtig en probeer opnieuw.",
  bleNoSignal:
    "Band gevonden maar geen hartslag. Draag de band en wacht op een meting.",
  bleConnectFailed: "Koppelen mislukt. Probeer opnieuw.",
  blePermissionDenied: "Bluetooth-toestemming is nodig om de band te koppelen.",
  bleReconnectPaired: (name: string) => `Opnieuw verbinden met ${name}`,
  bleReconnectHint: "Band al eerder gekoppeld? Probeer opnieuw verbinden zonder te scannen.",
  settingsRepairBand: "Hartslagband opnieuw koppelen",
  settingsBatteryOptimization: "Batterijbeheer instellen",
  settingsBatteryHint:
    "Zet batterijbeperkingen uit voor RPM. Op Realme: Instellingen → Batterij → App-batterijbeheer → RPM → Geen beperkingen.",
  foregroundNotificationTitle: "RPM actief",
  foregroundNotificationBody: "Hartslag wordt gemeten op de achtergrond",
  onboardingDoneTitle: "Systeem actief",
  onboardingDoneBody:
    "Baseline wordt de komende 14 dagen organisch opgebouwd. Een vaste melding houdt hartslagmeting actief als het scherm uit staat.",
  onboardingFinishing: "Baseline berekenen…",
  onboardingGoToGauge: "Naar de meter",

  appLoading: "Systeem opstarten…",

  morningFullBudget: (ep: number) => `Vandaag: ${ep} EP. Volle tank.`,
  morningMaintenance: (ep: number) =>
    `Systeem-onderhoudsdag geactiveerd. ${ep} EP. Blijf laag vandaag.`,
  morningProvisional: (ep: number) =>
    `Voorlopige schatting: ${ep} EP. Baseline wordt opgebouwd.`,

  hyperfocusSoft: "Verhoogd mentaal toerental gedetecteerd. Systeem bewaakt verbruik.",
  hyperfocusPushTitle: "RPM — toerental",

  eveningCool: (remaining: number) =>
    `Resterend: ${Math.round(remaining)} EP. De motor koel gehouden vandaag.`,
  eveningOver: () =>
    "Vandaag over het budget. Morgen start het systeem opnieuw met een schone meter.",

  sensorDisconnected: "Geen signaal — schakel over naar handmatige rust-modus.",
  sensorDegraded: "Signaal vertraagd — metingen kunnen afwijken.",
  heartRateLive: (bpm: number) => `Hartslag: ${bpm} bpm`,

  gaugeStatus: (remaining: number) => {
    if (remaining >= 60) {
      return `${Math.round(remaining)} EP over — rustige middag.`;
    }
    if (remaining >= 25) {
      return `${Math.round(remaining)} EP over — tempo bewaken.`;
    }
    return `${Math.round(remaining)} EP over — systeem onderhoud actief.`;
  },

  emergencyButton: "Ik voel me echt niet goed",
  emergencyPrompt: "Neem contact op met je hulpcontact of bel 112 bij acuut gevaar.",

  settingsTitle: "Systeem",
  exportData: "Mijn data exporteren",
  deleteData: "Mijn data verwijderen",
  deleteConfirm: "Alle gezondheids- en EP-data worden permanent verwijderd.",
} as const;
