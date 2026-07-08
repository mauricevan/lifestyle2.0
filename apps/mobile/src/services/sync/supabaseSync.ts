/**
 * Supabase sync for EP state and baselines.
 */

import type { Baseline, EpState } from "@rpm/shared-types";
import { getSupabaseClient } from "../supabase/client";
import { loadLocalEpState, saveLocalEpState } from "./localStore";

export async function pushEpStateToServer(state: EpState, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.from("daily_ep_state").upsert({
    user_id: userId,
    date: state.date,
    budget: state.budget,
    spent: state.spent,
    remaining: state.remaining,
    status: state.status,
    burn_rate_per_hour: state.burnRatePerHour,
    is_hyperfocus_active: state.isHyperfocusActive,
    sensor_status: state.sensorStatus,
    last_sync_at: new Date().toISOString(),
  });
}

export async function pullEpStateFromServer(
  date: string,
  userId: string
): Promise<EpState | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("daily_ep_state")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return {
    date: data.date,
    budget: data.budget,
    spent: Number(data.spent),
    remaining: Number(data.remaining),
    status: data.status,
    burnRatePerHour: Number(data.burn_rate_per_hour),
    isHyperfocusActive: data.is_hyperfocus_active,
    sensorStatus: data.sensor_status,
    lastUpdatedAt: new Date(data.last_sync_at),
  };
}

export async function mergeEpState(
  date: string,
  userId: string,
  local: EpState | null
): Promise<EpState | null> {
  const remote = await pullEpStateFromServer(date, userId);
  if (!remote) {
    return local;
  }
  if (!local) {
    await saveLocalEpState(remote);
    return remote;
  }
  const merged: EpState = {
    ...local,
    budget: remote.budget,
    spent: local.lastUpdatedAt > remote.lastUpdatedAt ? local.spent : remote.spent,
    remaining: local.lastUpdatedAt > remote.lastUpdatedAt ? local.remaining : remote.remaining,
    status: remote.status,
    lastUpdatedAt: local.lastUpdatedAt > remote.lastUpdatedAt ? local.lastUpdatedAt : remote.lastUpdatedAt,
  };
  merged.remaining = Math.max(0, merged.budget - merged.spent);
  await saveLocalEpState(merged);
  await pushEpStateToServer(merged, userId);
  return merged;
}

export async function pushBaselineToServer(
  baseline: Baseline,
  date: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.from("baselines").upsert({
    user_id: userId,
    date,
    morning_avg_hr: baseline.value,
    rolling_avg_hr: baseline.rollingAverage,
    deviation: baseline.deviation,
    is_provisional: baseline.isProvisional,
    computed_at: baseline.computedAt.toISOString(),
  });
}

export function subscribeEpStateRealtime(
  userId: string,
  onUpdate: (state: EpState) => void
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return () => undefined;
  }
  const channel = supabase
    .channel(`daily_ep_state:${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "daily_ep_state", filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        if (!row.date) {
          return;
        }
        onUpdate({
          date: String(row.date),
          budget: Number(row.budget),
          spent: Number(row.spent),
          remaining: Number(row.remaining),
          status: row.status as EpState["status"],
          burnRatePerHour: Number(row.burn_rate_per_hour),
          isHyperfocusActive: Boolean(row.is_hyperfocus_active),
          sensorStatus: row.sensor_status as EpState["sensorStatus"],
          lastUpdatedAt: new Date(String(row.last_sync_at)),
        });
      }
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {};
  }
  const [ep, baselines, hyperfocus] = await Promise.all([
    supabase.from("daily_ep_state").select("*").eq("user_id", userId),
    supabase.from("baselines").select("*").eq("user_id", userId),
    supabase.from("hyperfocus_events").select("*").eq("user_id", userId),
  ]);
  return {
    daily_ep_state: ep.data ?? [],
    baselines: baselines.data ?? [],
    hyperfocus_events: hyperfocus.data ?? [],
  };
}

export async function deleteUserData(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }
  await Promise.all([
    supabase.from("daily_ep_state").delete().eq("user_id", userId),
    supabase.from("baselines").delete().eq("user_id", userId),
    supabase.from("hr_samples_daily").delete().eq("user_id", userId),
    supabase.from("hyperfocus_events").delete().eq("user_id", userId),
    supabase.from("sensor_status_log").delete().eq("user_id", userId),
  ]);
}
