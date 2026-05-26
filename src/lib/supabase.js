// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Supabase client — reads from .env (or Vercel environment vars)
// ─────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw error;

  // Create profile row
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      username,
      email,
    });
  }
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─────────────────────────────────────────────────────────────
// PICKS HELPERS
// ─────────────────────────────────────────────────────────────

/** Save or update picks for a user + tournament */
export async function savePicks(userId, tournamentId, picks) {
  const { error } = await supabase
    .from("picks")
    .upsert(
      { user_id: userId, tournament_id: tournamentId, picks_json: picks, updated_at: new Date().toISOString() },
      { onConflict: "user_id,tournament_id" }
    );
  if (error) throw error;
}

/** Load picks for a user + tournament */
export async function loadPicks(userId, tournamentId) {
  const { data, error } = await supabase
    .from("picks")
    .select("picks_json")
    .eq("user_id", userId)
    .eq("tournament_id", tournamentId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data?.picks_json || {};
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARD HELPERS
// ─────────────────────────────────────────────────────────────

/** Fetch leaderboard for a tournament (top 50) */
export async function fetchLeaderboard(tournamentId) {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("username, score, correct_picks, total_picks, updated_at")
    .eq("tournament_id", tournamentId)
    .order("score", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

/** Upsert a user's leaderboard score */
export async function updateLeaderboard(userId, tournamentId, username, score, correctPicks, totalPicks) {
  const { error } = await supabase
    .from("leaderboard")
    .upsert(
      {
        user_id: userId,
        tournament_id: tournamentId,
        username,
        score,
        correct_picks: correctPicks,
        total_picks: totalPicks,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,tournament_id" }
    );
  if (error) throw error;
}
