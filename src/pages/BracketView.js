// src/pages/BracketView.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/AuthContext";
import { savePicks, loadPicks, updateLeaderboard } from "../lib/supabase";
import { calculateScore } from "../lib/scoring";
import { ROUNDS, ROUND_LABELS } from "../lib/draws";
import MatchCard from "../components/MatchCard";

export default function BracketView({ tournament, draw, onShowAuth }) {
  const { user, profile } = useAuth();
  const t = tournament.theme;

  const [picks, setPicks]         = useState({});
  const [activeRound, setActiveRound] = useState("R128");
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState(null);
  const [scoreInfo, setScoreInfo] = useState({ score: 0, correct: 0, total: 0 });

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

  const handlePick = useCallback((round, matchId, player) => {
    const key = `${round}-${matchId}`;
    setPicks(prev => ({ ...prev, [key]: player }));
  }, []);

  async function handleSave() {
    if (!user) { onShowAuth(); return; }
    setSaving(true);
    try {
      await savePicks(user.id, tournament.id, picks);
      // Update leaderboard
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

  // Get matches for the active round
  const roundMatches = draw[activeRound] || [];
  const completedCount = roundMatches.filter(m => m.status === "complete").length;
  const pickedCount = roundMatches.filter(m => m.status !== "complete" && picks[`${activeRound}-${m.id}`]).length;
  const openCount = roundMatches.filter(m => m.status !== "complete").length;

  // Split R128 into halves for layout
  const topHalf = activeRound === "R128" ? roundMatches.slice(0, 32) : [];
  const bottomHalf = activeRound === "R128" ? roundMatches.slice(32) : [];

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
          const rMatches = draw[r] || [];
          const hasData = rMatches.length > 0;
          return (
            <button key={r} onClick={() => hasData && setActiveRound(r)} style={{
              padding: "12px 18px",
              background: activeRound === r ? `${t.primary}22` : "transparent",
              border: "none",
              borderBottom: activeRound === r ? `3px solid ${t.primary}` : "3px solid transparent",
              color: activeRound === r ? t.white : hasData ? t.textDim : `${t.textDim}55`,
              cursor: hasData ? "pointer" : "not-allowed",
              fontSize: 12, fontWeight: activeRound === r ? 700 : 400,
              letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}>
              {ROUND_LABELS[r]}
            </button>
          );
        })}
      </div>

      {/* Round stats bar */}
      <div style={{
        display: "flex", gap: 16, padding: "10px 24px",
        background: `${t.primary}0f`,
        borderBottom: `1px solid ${t.border}44`,
        flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <StatChip label="Completed" value={completedCount} color="#4caf50" />
          <StatChip label="Your picks" value={`${pickedCount}/${openCount}`} color={t.accent} />
          {user && <StatChip label="Your score" value={`${scoreInfo.score} pts`} color={t.primary} />}
        </div>

        {/* Save button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveMsg && (
            <span style={{ fontSize: 13, color: saveMsg.includes("Error") ? "#ff7070" : "#4caf50" }}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px",
              background: t.primary,
              border: "none", borderRadius: 8,
              color: t.white, fontSize: 13, fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {saving ? "Saving…" : user ? "Save Picks" : "Sign in to Save"}
          </button>
        </div>
      </div>

      {/* Bracket grid */}
      <div style={{ padding: "20px 16px" }}>
        {activeRound === "R128" && roundMatches.length > 0 ? (
          <>
            <SectionHeader title="Top Half of Draw" subtitle="Sinner · Shelton · Medvedev" theme={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10, marginBottom: 36 }}>
              {topHalf.map(m => (
                <MatchCard key={m.id} match={m} round={activeRound} picks={picks} onPick={handlePick} theme={t} />
              ))}
            </div>
            <SectionHeader title="Bottom Half of Draw" subtitle="Djokovic · Auger-Aliassime · Zverev" theme={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
              {bottomHalf.map(m => (
                <MatchCard key={m.id} match={m} round={activeRound} picks={picks} onPick={handlePick} theme={t} />
              ))}
            </div>
          </>
        ) : roundMatches.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
            {roundMatches.map(m => (
              <MatchCard key={m.id} match={m} round={activeRound} picks={picks} onPick={handlePick} theme={t} />
            ))}
          </div>
        ) : (
          <LockedRound round={activeRound} theme={t} />
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

function LockedRound({ round, theme: t }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 360, textAlign: "center", gap: 14,
    }}>
      <div style={{ fontSize: 56 }}>🔒</div>
      <h2 style={{ margin: 0, fontSize: 22, color: t.text }}>{ROUND_LABELS[round]}</h2>
      <p style={{ margin: 0, color: t.textDim, fontSize: 14, maxWidth: 380, lineHeight: 1.7 }}>
        This round will unlock once the previous round is complete and results are entered.
        Your picks from earlier rounds will automatically advance the winners here.
      </p>
      <div style={{
        padding: "10px 22px",
        background: `${t.primary}18`,
        border: `1px solid ${t.primary}44`,
        borderRadius: 8, fontSize: 13, color: t.textDim,
      }}>
        ← Make your picks in the First Round first
      </div>
    </div>
  );
}
