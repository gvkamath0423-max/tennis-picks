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

  const [picks, setPicks]             = useState({});
  const [activeRound, setActiveRound] = useState("R64");
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState(null);
  const [scoreInfo, setScoreInfo]     = useState({ score: 0, correct: 0, total: 0 });

  useEffect(() => {
    if (!user) return;
    loadPicks(user.id, tournament.id)
      .then(saved => { if (saved) setPicks(saved); })
      .catch(() => {});
  }, [user, tournament.id]);

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

  // ── Get winner of a match (real result takes priority, then user pick) ──
  function getMatchWinner(round, match) {
    if (match.status === "complete") return match.winner;
    return picks[`${round}-${match.id}`] || null;
  }

  // ── Build R32 and beyond from R64 picks ──
  // R64 matches are preset in draw data (real matchups)
  // R32+ are generated from winners of previous round
  function buildGeneratedRound(prevRoundKey, prevMatches) {
    const matches = [];
    for (let i = 0; i < prevMatches.length; i += 2) {
      const m1 = prevMatches[i];
      const m2 = prevMatches[i + 1];
      if (!m1) break;
      const w1 = getMatchWinner(prevRoundKey, m1) || "TBD";
      const w2 = m2 ? (getMatchWinner(prevRoundKey, m2) || "TBD") : "TBD";
      const newId = 200 + matches.length + (prevRoundKey === "R64" ? 0 : prevRoundKey === "R32" ? 100 : prevRoundKey === "R16" ? 200 : prevRoundKey === "QF" ? 300 : 400);
      matches.push({
        id: newId,
        p1: w1,
        p2: w2,
        status: "upcoming",
        winner: null,
      });
    }
    return matches;
  }

  // Build all rounds
  const r64Matches  = draw["R64"] || [];
  const r32Matches  = buildGeneratedRound("R64", r64Matches);
  const r16Matches  = buildGeneratedRound("R32", r32Matches);
  const qfMatches   = buildGeneratedRound("R16", r16Matches);
  const sfMatches   = buildGeneratedRound("QF",  qfMatches);
  const fMatches    = buildGeneratedRound("SF",  sfMatches);

  const generatedDraw = {
    R128: draw["R128"] || [],
    R64:  r64Matches,
    R32:  r32Matches,
    R16:  r16Matches,
    QF:   qfMatches,
    SF:   sfMatches,
    F:    fMatches,
  };

  const roundMatches = generatedDraw[activeRound] || [];
  const completedCount = roundMatches.filter(m => m.status === "complete").length;
  const openMatches    = roundMatches.filter(m => m.status !== "complete");
  const pickedCount    = openMatches.filter(m => picks[`${activeRound}-${m.id}`] && m.p1 !== "TBD" && m.p2 !== "TBD").length;
  const openCount      = openMatches.length;

  return (
    <div>
      {/* Round tabs */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${t.border}`,
        overflowX: "auto", background: t.surface,
        position: "sticky", top: 64, zIndex: 50,
      }}>
        {ROUNDS.map(r => (
          <button key={r} onClick={() => setActiveRound(r)} style={{
            padding: "12px 18px",
            background: activeRound === r ? `${t.primary}22` : "transparent",
            border: "none",
            borderBottom: activeRound === r ? `3px solid ${t.primary}` : "3px solid transparent",
            color: activeRound === r ? t.white : t.textDim,
            cursor: "pointer", fontSize: 12,
            fontWeight: activeRound === r ? 700 : 400,
            letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}>
            {ROUND_LABELS[r]}
          </button>
        ))}
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
          {activeRound !== "R128" && activeRound !== "R64" && (
            <span style={{ fontSize: 12, color: t.textDim, fontStyle: "italic" }}>
              💡 Winners from your previous picks appear here automatically
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveMsg && (
            <span style={{ fontSize: 13, color: saveMsg.includes("Error") ? "#ff7070" : "#4caf50" }}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear ALL your picks? This cannot be undone.")) {
                setPicks({});
                setSaveMsg("Picks cleared!");
                setTimeout(() => setSaveMsg(null), 3000);
              }
            }}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #cc4444",
              borderRadius: 8, color: "#cc4444",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🗑 Clear Picks
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "8px 20px", background: t.primary,
            border: "none", borderRadius: 8, color: t.white,
            fontSize: 13, fontWeight: 700,
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
            <SectionHeader title="Top Half of Draw" subtitle="Round 1 — completed results shown in green" theme={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10, marginBottom: 36 }}>
              {(generatedDraw["R128"] || []).slice(0, 32).map(m => (
                <MatchCard key={m.id} match={m} round="R128" picks={picks} onPick={handlePick} theme={t} />
              ))}
            </div>
            <SectionHeader title="Bottom Half of Draw" subtitle="Round 1 — completed results shown in green" theme={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
              {(generatedDraw["R128"] || []).slice(32).map(m => (
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
                : "Your picked winners appear here — pick who advances next"}
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
