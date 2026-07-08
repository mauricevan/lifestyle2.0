/**
 * On-device TTS for evening reports.
 */

import * as Speech from "expo-speech";

export function speakEveningReport(message: string): void {
  Speech.stop();
  Speech.speak(message, {
    language: "nl-NL",
    rate: 0.9,
    pitch: 1.0,
  });
}

export function stopSpeech(): void {
  Speech.stop();
}
