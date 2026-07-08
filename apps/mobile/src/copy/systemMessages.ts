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
    "RPM leest hartslag, stappen en slaap automatisch. Geen invoer nodig.",
  onboardingWearableConnect: "Toegang verlenen",
  onboardingDoneTitle: "Systeem actief",
  onboardingDoneBody:
    "Baseline wordt de komende 14 dagen organisch opgebouwd. Open de app wanneer je wilt — de meter werkt op de achtergrond.",

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
