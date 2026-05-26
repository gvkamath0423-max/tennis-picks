// src/pages/BracketView.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/AuthContext";
import { savePicks, loadPicks, updateLeaderboard } from "../lib/supabase";
import { calculateScore } from "../lib/scoring";
import { ROUNDS, ROUND_LABELS } from "../lib/draws";
import MatchCard from "../components/MatchCard";

// ─── BRACKET PROGRESSION ─────────────────────────────────────────────────────
// Given a round and match index, returns which match + slot in the next round
// Matches pair up: (0,1) → 0, (2,3) → 1, etc.
function getNextRoundMatch(matchIndex) {
  return Math.floor(matchIndex / 2);
}

// Build the "live" bracket from a base draw + user picks
// For each subsequent round, populate p1/p2 from the winners of the previous round
function buildLiveBracket(draw, picks) {
  const rounds = ["R128", "R64", "R32", "R16", "QF", "SF", "F"];
  const liveDraw = {};

  // R128 stays as-is from the draw data
  liveDraw["R128"] = (draw["R128"] || []).map(m => ({ ...m }));

  // For each subsequent round, build matches from previous round winners
  for (let ri = 1; ri < rounds.length; ri++) {
    const round = rounds[ri];
    const prevRound = rounds[ri - 1];
    const prevMatches = liveDraw[prevRound] || [];

    // If the draw already has pre-set matches for this round (e.g. R64 with real players), use those
    const presetMatches = draw[round] || [];

    if (presetMatches.length > 0) {
      // Use preset matches but populate empty slots from picks where possible
      liveDraw[round] = presetMatches.map(m => ({ ...m }));
    } else {
      // Build matches from previous round winners
      const matches = [];
      for (let i = 0; i < prevMatches.length; i += 2) {
        const m1 = prevMatches[i];
        const m2 = prevMatches[i + 1];
        if (!m1) break;

        // Get winner of m1
        const w1 = m1.status === "complete"
          ? m1.winner
          : picks[`${prevRound}-${m1.id}`] || null;

        // Get winner of m2
        const w2 = m2
          ? (m2.status === "complete"
            ? m2.winner
            : picks[`${prevRound}-${m2.id}`] || null)
          : null;

        matches.push({
          id: matches.length + 1,
          p1: w1 || "TBD",
          p2: w2 || "TBD",
          status: "upcoming",
          winner: null,
          // Check if real result exists
          ...(draw[round]?.[matches.length] || {}),
        });
      }
      liveDraw[round] = matches;
    }
  }

  return liveDraw;
}

export default function BracketView({ tournament, draw, onShowAuth }) {
  const { user, profile } = useAuth();
  const t = tournament.theme;

  const [picks, setPicks]             = useState({});
  const [activeRound, setActiveRound] = useState("R64");
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState(null);
  const [scoreInfo, setScoreInfo]     = useState({ score: 0, correct: 0, total: 0 });

  // Load picks from Supabase when user signs in
  useEffect(() => {
    if (!user) return;
    loadPicks(user.id, tournament.id)
      .then(saved => { if (saved) setPicks(saved); })
      .catch(() => {});
  }, [user, tournament.id]);

  // Recalculate score whenever picks change
  useEffect(() => {
    const info = calculateScore(picks, draw);
    setScoreInfo(info);
  }, [picks, draw]);

  // When a pick is made, also clear any downstream picks that depended on the old pick
  const handlePick = useCallback((round, matchId, player) => {
    const key = `${round}-${matchId}`;
    setPicks(prev => {
      const next = { ...prev, [key]: player };
      // Clear downstream picks that are now invalid
      // (simplified: just update the pick, downstream will show TBD)
      return next;
    });
  }, []);

  async function handleSave() {
    if (!user) { onShowAuth(); return; }
    setSaving(true);
    try {
      await savePicks(user.id, tournament.id, picks);
      if (profile?.username) {
        await updateLeaderboard(
          user.id, tournament.id, profile.username,
          scoreInfo.score, scoreInfo.correct, scoreInfo.total
        );
      }
      setSaveMsg("Picks saved! ✓");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e) {
      setSaveMsg("Error saving. Try again.");
    }
    setSaving(false);
  }

  // Build the live bracket with picks flowing through
  const liveDraw = buildLiveBracket(draw, picks);
  const roundMatches = liveDraw[activeRound] || [];

  // Count stats for active round
  const completedCount = roundMatches.filter(m => m.status === "complete").length;
  const openMatches    = roundMatches.filter(m => m.status !== "complete");
  const pickedCount    = openMatches.filter(m => picks[`${activeRound}-${m.id}`] && m.p1 !== "TBD" && m.p2 !== "TBD").length;
  const openCount      = openMatches.length;

  // Which rounds have data to show
  const availableRounds = ROUNDS.filter(r => (liveDraw[r] || []).length > 0 || r === "R128");

  return (
    <div>
      {/* Round tabs */}
      <div style={{
        display: "flex",
        borderBottom: `1px solid ${t.border}`,
        overflowX: "auto",
        background: t.surface,
        position: "sticky", top: 64, zIndex: 50,
      }}>
        {ROUNDS.map(r => {
          const rMatches = liveDraw[r] || [];
          const hasData = rMatches.length > 0;
          return (
            <button key={r} onClick={() => setActiveRound(r)} style={{
              padding: "12px 18px",
              background: activeRound === r ? `${t.primary}22` : "transparent",
              border: "none",
              borderBottom: activeRound === r ? `3px solid ${t.primary}` : "3px solid transparent",
              color: activeRound === r ? t.white : hasData ? t.textDim : `${t.textDim}44`,
              cursor: "pointer",
              fontSize: 12, fontWeight: activeRound === r ? 700 : 400,
              letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}>
              {ROUND_LABELS[r]}
            </button>
          );
        })}
      </div>

      {/* Stats + save bar */}
      <div style={{
        display: "flex", gap: 16, padding: "10px 24px",
        background: `${t.primary}0f`,
        borderBottom: `1px solid ${t.border}44`,
        flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          <StatChip label="Completed" value={completedCount} color="#4caf50" />
          <StatChip label="Your picks" value={`${pickedCount}/${openCount}`} color={t.accent} />
          {user && <StatChip label="Your score" value={`${scoreInfo.score} pts`} color={t.primary} />}
          {activeRound !== "R128" && (
            <span style={{ fontSize: 12, color: t.textDim, fontStyle: "italic" }}>
              💡 Pick winners — they advance automatically to the next round
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveMsg && (
            <span style={{ fontSize: 13, color: saveMsg.includes("Error") ? "#ff7070" : "#4caf50" }}>
              {saveMsg}
            </span>
          )}
          <button onClick={handleSave} disabled={saving} style={{
            padding: "8px 20px",
            background: t.primary, border: "none", borderRadius: 8,
            color: t.white, fontSize: 13, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1, transition: "opacity 0.2s",
          }}>
            {saving ? "Saving…" : user ? "Save Picks" : "Sign in to Save"}
          </button>
        </div>
      </div>

      {/* Bracket grid */}
      <div style={{ padding: "20px 16px" }}>
        {activeRound === "R128" ? (
          <>
            <SectionHeader title="Top Half of Draw" subtitle="Round 1 — locked results shown in green" theme={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10, marginBottom: 36 }}>
              {(liveDraw["R128"] || []).slice(0, 32).map(m => (
                <MatchCard key={m.id} match={m} round="R128" picks={picks} onPick={handlePick} theme={t} />
              ))}
            </div>
            <SectionHeader title="Bottom Half of Draw" subtitle="Round 1 — locked results shown in green" theme={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
              {(liveDraw["R128"] || []).slice(32).map(m => (
                <MatchCard key={m.id} match={m} round="R128" picks={picks} onPick={handlePick} theme={t} />
              ))}
            </div>
          </>
        ) : roundMatches.length > 0 ? (
          <>
            <SectionHeader
              title={ROUND_LABELS[activeRound]}
              subtitle={activeRound === "R64"
                ? "Pick winners — they advance to Round 3 automatically"
                : "Winners from your previous picks appear here automatically"}
              theme={t}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
              {roundMatches.map(m => (
                <MatchCard key={m.id} match={m} round={activeRound} picks={picks} onPick={handlePick} theme={t} />
              ))}
            </div>
          </>
        ) : (
          <EmptyRound round={activeRound} theme={t} />
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, theme: t }) {
  return (
    <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${t.primary}33` }}>
      <h2 style={{ margin: 0, fontSize: 17, color: t.text, fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: "3px 0 0", fontSize: 11, color: t.textDim, letterSpacing: 1, textTransform: "uppercase" }}>{subtitle}</p>
    </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div style={{ fontSize: 12 }}>
      <span style={{ color: "#888" }}>{label}: </span>
      <span style={{ fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function EmptyRound({ round, theme: t }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 360, textAlign: "center", gap: 14,
    }}>
      <div style={{ fontSize: 56 }}>🎾</div>
      <h2 style={{ margin: 0, fontSize: 22, color: t.text }}>{ROUND_LABELS[round]}</h2>
      <p style={{ margin: 0, color: t.textDim, fontSize: 14, maxWidth: 380, lineHeight: 1.7 }}>
        Make your picks in the earlier rounds first — your winners will automatically appear here!
      </p>
    </div>
  );
}
