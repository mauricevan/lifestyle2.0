/**
 * Local SQLite persistence for offline-first EP state.
 */

import * as SQLite from "expo-sqlite";
import type { EpState, Baseline } from "@rpm/shared-types";

const DB_NAME = "rpm-local.db";

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ep_state (
        date TEXT PRIMARY KEY,
        payload TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS baselines (
        date TEXT PRIMARY KEY,
        payload TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS onboarding (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }
  return db;
}

export async function saveLocalEpState(state: EpState): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "INSERT OR REPLACE INTO ep_state (date, payload) VALUES (?, ?)",
    [state.date, JSON.stringify(state)]
  );
}

export async function loadLocalEpState(date: string): Promise<EpState | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM ep_state WHERE date = ?",
    [date]
  );
  if (!row) {
    return null;
  }
  const parsed = JSON.parse(row.payload) as EpState;
  return { ...parsed, lastUpdatedAt: new Date(parsed.lastUpdatedAt) };
}

export async function saveLocalBaseline(date: string, baseline: Baseline): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "INSERT OR REPLACE INTO baselines (date, payload) VALUES (?, ?)",
    [date, JSON.stringify(baseline)]
  );
}

export async function loadRecentBaselines(limit = 14): Promise<number[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ payload: string }>(
    "SELECT payload FROM baselines ORDER BY date DESC LIMIT ?",
    [limit]
  );
  return rows.map((row) => {
    const baseline = JSON.parse(row.payload) as Baseline;
    return baseline.value;
  });
}

export async function setOnboardingFlag(key: string, value: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "INSERT OR REPLACE INTO onboarding (key, value) VALUES (?, ?)",
    [key, value]
  );
}

export async function getOnboardingFlag(key: string): Promise<string | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM onboarding WHERE key = ?",
    [key]
  );
  return row?.value ?? null;
}

export async function clearAllLocalData(): Promise<void> {
  const database = await getDb();
  await database.execAsync("DELETE FROM ep_state; DELETE FROM baselines; DELETE FROM onboarding;");
}
