/**
 * Entry redirect — onboarding vs gauge.
 */

import { Redirect } from "expo-router";
import { useRpmBootstrap } from "../src/hooks/useRpmBootstrap";

export default function IndexScreen() {
  const { isReady, needsOnboarding } = useRpmBootstrap();
  if (!isReady) {
    return null;
  }
  if (needsOnboarding) {
    return <Redirect href="/onboarding/disclaimer" />;
  }
  return <Redirect href="/gauge" />;
}
