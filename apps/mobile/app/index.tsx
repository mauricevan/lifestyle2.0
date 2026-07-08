/**
 * Entry redirect — onboarding vs gauge.
 */

import { Redirect } from "expo-router";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { systemMessages } from "../src/copy/systemMessages";
import { useRpmBootstrap } from "../src/hooks/useRpmBootstrap";

export default function IndexScreen() {
  const { isReady, needsOnboarding } = useRpmBootstrap();
  if (!isReady) {
    return <LoadingScreen message={systemMessages.appLoading} />;
  }
  if (needsOnboarding) {
    return <Redirect href="/onboarding/disclaimer" />;
  }
  return <Redirect href="/gauge" />;
}
