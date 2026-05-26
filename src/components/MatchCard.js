// src/components/MatchCard.js

export default function MatchCard({ match, round, picks, onPick, theme }) {
  const t = theme;
  const pickKey = `${round}-${match.id}`;
  const userPick = picks[pickKey];
  const isLocked = match.status === "complete";
  const winner = isLocked ? match.winner : userPick;

  return (
    <div style={{
      background: isLocked ? `${t.bg}` : t.card,
      border: `1px solid ${isLocked ? t.border + "88" : t.border}`,
      borderRadius: 10,
      overflow: "hidden",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => {
        if (!isLocked) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 6px 20px ${t.primary}44`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Match header */}
      <div style={{
        padding: "5px 12px",
        background: isLocked ? `${t.primary}18` : `${t.surface}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${t.border}44`,
      }}>
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: t.textDim }}>
          Match {match.id}
        </span>
        <StatusBadge status={match.status} theme={t} />
      </div>

      {/* Players */}
      <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        <PlayerRow
          player={match.p1}
          isWinner={winner === match.p1}
          isLocked={isLocked}
          onPick={() => !isLocked && onPick(round, match.id, match.p1)}
          theme={t}
        />
        <div style={{ textAlign: "center", fontSize: 10, color: t.textDim, letterSpacing: 2 }}>VS</div>
        <PlayerRow
          player={match.p2}
          isWinner={winner === match.p2}
          isLocked={isLocked}
          onPick={() => !isLocked && onPick(round, match.id, match.p2)}
          theme={t}
        />
      </div>

      {/* Footer */}
      {isLocked && winner ? (
        <div style={{
          padding: "5px 12px",
          background: "rgba(76,175,80,0.1)",
          borderTop: `1px solid rgba(76,175,80,0.25)`,
          fontSize: 11, color: "#4caf50", fontWeight: 600,
        }}>
          ✓ {winner} advances
        </div>
      ) : !isLocked && !winner ? (
        <div style={{
          padding: "5px 12px",
          borderTop: `1px solid ${t.border}44`,
          fontSize: 11, color: t.textDim, fontStyle: "italic",
        }}>
          Tap a player to pick
        </div>
      ) : !isLocked && winner ? (
        <div style={{
          padding: "5px 12px",
          background: `${t.primary}18`,
          borderTop: `1px solid ${t.primary}44`,
          fontSize: 11, color: t.primary, fontWeight: 600,
        }}>
          ✎ Tap to change pick
        </div>
      ) : null}
    </div>
  );
}

function PlayerRow({ player, isWinner, isLocked, onPick, theme }) {
  const t = theme;
  const seedMatch = player.match(/\[(\d+)\]/);
  const seedNum = seedMatch ? parseInt(seedMatch[1]) : null;
  const isTopSeed = seedNum && seedNum <= 8;
  const badge = player.includes("(WC)") ? "WC" : player.includes("(Q)") ? "Q" : player.includes("(LL)") ? "LL" : null;
  const cleanName = player.replace(/\s*\[\d+\]/, "").replace(/\s*\([^)]+\)/, "");

  return (
    <div
      onClick={onPick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 8px",
        borderRadius: 6,
        cursor: isLocked ? "default" : "pointer",
        background: isWinner
          ? (isLocked ? "rgba(76,175,80,0.12)" : `${t.primary}28`)
          : "transparent",
        border: isWinner
          ? `1px solid ${isLocked ? "rgba(76,175,80,0.3)" : t.primary + "55"}`
          : "1px solid transparent",
        transition: "all 0.12s",
      }}
      onMouseEnter={e => {
        if (!isLocked && !isWinner) {
          e.currentTarget.style.background = `${t.primary}18`;
          e.currentTarget.style.border = `1px solid ${t.primary}33`;
        }
      }}
      onMouseLeave={e => {
        if (!isWinner) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.border = "1px solid transparent";
        }
      }}
    >
      {/* Seed badge */}
      <div style={{
        width: 22, height: 22, borderRadius: 4, flexShrink: 0,
        background: isTopSeed ? t.primary : (seedNum ? `${t.primary}44` : "transparent"),
        border: seedNum ? `1px solid ${t.primary}55` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700,
        color: isTopSeed ? t.white : t.textDim,
      }}>
        {seedNum || ""}
      </div>

      {/* Name */}
      <span style={{ flex: 1, fontSize: 13, fontWeight: isWinner ? 700 : 400, color: isWinner ? t.white : t.text }}>
        {cleanName}
        {badge && <span style={{ fontSize: 10, color: t.textDim, marginLeft: 4 }}>({badge})</span>}
      </span>

      {isWinner && isLocked && <span style={{ fontSize: 12, color: "#4caf50" }}>✓</span>}
      {isWinner && !isLocked && (
        <span style={{ fontSize: 10, color: t.primary, fontWeight: 700, letterSpacing: 1 }}>PICK</span>
      )}
    </div>
  );
}

function StatusBadge({ status, theme: t }) {
  if (status === "complete") return (
    <span style={{
      fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 20,
      background: "rgba(76,175,80,0.2)", color: "#4caf50",
      border: "1px solid rgba(76,175,80,0.35)", fontWeight: 700,
    }}>✓ Final</span>
  );
  return (
    <span style={{
      fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 20,
      background: `${t.accent}22`, color: t.accent,
      border: `1px solid ${t.accent}44`,
    }}>Pick</span>
  );
}
