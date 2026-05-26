// src/components/Leaderboard.js
import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Leaderboard({ tournamentId, theme }) {
  const { user, profile } = useAuth();
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const t = theme;

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLeaderboard(tournamentId);
        setRows(data);
      } catch (e) {
        setError("Couldn't load leaderboard.");
      }
      setLoading(false);
    }
    load();
  }, [tournamentId]);

  const medal = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        background: `${t.primary}22`,
        borderBottom: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h3 style={{ margin: 0, color: t.white, fontSize: 16 }}>🏆 Leaderboard</h3>
          <p style={{ margin: "2px 0 0", color: t.textDim, fontSize: 12 }}>
            Top {rows.length} predictors
          </p>
        </div>
        <div style={{ fontSize: 11, color: t.textDim }}>
          Points: R1×10 → Final×640
        </div>
      </div>

      {loading && (
        <div style={{ padding: 32, textAlign: "center", color: t.textDim }}>
          Loading…
        </div>
      )}

      {error && (
        <div style={{ padding: 20, color: "#ff7070", fontSize: 13 }}>{error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎾</div>
          <p style={{ color: t.textDim, fontSize: 14 }}>
            No picks submitted yet. Be the first!
          </p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div>
          {rows.map((row, i) => {
            const isMe = profile?.username === row.username;
            return (
              <div
                key={row.username}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px",
                  background: isMe ? `${t.primary}18` : "transparent",
                  borderBottom: i < rows.length - 1 ? `1px solid ${t.border}44` : "none",
                  borderLeft: isMe ? `3px solid ${t.primary}` : "3px solid transparent",
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 32, textAlign: "center",
                  fontSize: medal(i) ? 20 : 14,
                  color: medal(i) ? undefined : t.textDim,
                  fontWeight: 700,
                }}>
                  {medal(i) || `#${i + 1}`}
                </div>

                {/* Name */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: isMe ? 700 : 500,
                    color: isMe ? t.white : t.text,
                  }}>
                    {row.username}
                    {isMe && <span style={{ fontSize: 11, color: t.accent, marginLeft: 6 }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: 11, color: t.textDim }}>
                    {row.correct_picks ?? 0} correct / {row.total_picks ?? 0} scored
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: i === 0 ? t.accent : t.text,
                }}>
                  {row.score ?? 0}
                  <span style={{ fontSize: 11, color: t.textDim, marginLeft: 3 }}>pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
