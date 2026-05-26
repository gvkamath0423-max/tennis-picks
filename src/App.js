// src/App.js
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { signOut } from "./lib/supabase";
import { TOURNAMENTS, DRAWS } from "./lib/draws";
import AuthModal from "./components/AuthModal";
import Leaderboard from "./components/Leaderboard";
import BracketView from "./pages/BracketView";

// ─── Root with Auth provider ─────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}

// ─── Main app shell ──────────────────────────────────────────
function Inner() {
  const { user, profile, loading } = useAuth();

  const [activeTournament, setActiveTournament] = useState(TOURNAMENTS[0]);
  const [activeTab, setActiveTab]   = useState("bracket"); // "bracket" | "leaderboard"
  const [showAuth, setShowAuth]     = useState(false);
  const [showTournamentMenu, setShowTournamentMenu] = useState(false);

  const t = activeTournament.theme;
  const draw = DRAWS[activeTournament.id] || { R128: [], R64: [], R32: [], R16: [], QF: [], SF: [], F: [] };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      fontFamily: "'Georgia', serif",
      color: t.text,
    }}>

      {/* ── HEADER ── */}
      <header style={{
        background: `linear-gradient(135deg, ${t.primaryDark} 0%, ${t.primary} 60%, ${t.primaryDark} 100%)`,
        borderBottom: `2px solid ${t.accent}`,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          padding: "14px 20px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          {/* Logo + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 28 }}>{t.emoji}</div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: `${t.white}99`, marginBottom: 1 }}>
                Men's Singles · Bracket Predictor
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.white, letterSpacing: 0.5 }}>
                TennisPicks
              </h1>
            </div>
          </div>

          {/* Tournament selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowTournamentMenu(v => !v)}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.12)",
                border: `1px solid rgba(255,255,255,0.25)`,
                borderRadius: 8,
                color: t.white, fontSize: 13, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span>{activeTournament.name} {activeTournament.year}</span>
              <StatusDot status={activeTournament.status} />
              <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
            </button>

            {showTournamentMenu && (
              <TournamentMenu
                tournaments={TOURNAMENTS}
                active={activeTournament}
                onSelect={t => { setActiveTournament(t); setShowTournamentMenu(false); }}
                onClose={() => setShowTournamentMenu(false)}
              />
            )}
          </div>

          {/* Auth / user */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <>
                <div style={{ fontSize: 13, color: `${t.white}cc` }}>
                  👤 <strong style={{ color: t.white }}>{profile?.username || user.email}</strong>
                </div>
                <button
                  onClick={() => signOut()}
                  style={{
                    padding: "7px 14px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 7, color: t.white, fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  padding: "8px 18px",
                  background: t.accent,
                  border: "none", borderRadius: 8,
                  color: "#000", fontSize: 13, fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Sign in / Sign up
              </button>
            )}
          </div>
        </div>

        {/* Tournament info bar */}
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          padding: "6px 20px 10px",
          display: "flex", gap: 20, flexWrap: "wrap",
        }}>
          <InfoChip icon="📍" text={activeTournament.location} theme={t} />
          <InfoChip icon="📅" text={activeTournament.dates} theme={t} />
          <InfoChip icon="🎾" text={activeTournament.surface} theme={t} />
          {activeTournament.status === "live" && (
            <InfoChip icon="⚡" text="LIVE NOW" theme={t} highlight />
          )}
        </div>
      </header>

      {/* ── TAB NAV ── */}
      <div style={{
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
      }}>
        {["bracket", "leaderboard"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "13px 24px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? `3px solid ${t.accent}` : "3px solid transparent",
              color: activeTab === tab ? t.white : t.textDim,
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
              letterSpacing: 1, textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {tab === "bracket" ? "🏆 Bracket" : "📊 Leaderboard"}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: 1400, margin: "0 auto" }}>
        {activeTournament.status === "upcoming" ? (
          <UpcomingTournament tournament={activeTournament} theme={t} />
        ) : activeTab === "bracket" ? (
          <BracketView
            tournament={activeTournament}
            draw={draw}
            onShowAuth={() => setShowAuth(true)}
          />
        ) : (
          <div style={{ padding: "24px 16px" }}>
            <Leaderboard tournamentId={activeTournament.id} theme={t} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "28px 16px",
        color: t.textDim, fontSize: 12,
        borderTop: `1px solid ${t.border}44`,
        marginTop: 48,
      }}>
        <div style={{ marginBottom: 4 }}>🎾 TennisPicks · Men's Slam & Masters 1000 Bracket Predictor</div>
        <div>Free to use · Sign up to save your picks & compete on the leaderboard</div>
      </footer>

      {/* Auth modal */}
      {showAuth && <AuthModal theme={t} onClose={() => setShowAuth(false)} />}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function StatusDot({ status }) {
  const color = status === "live" ? "#4caf50" : status === "complete" ? "#888" : "#f0c020";
  const label = status === "live" ? "LIVE" : status === "complete" ? "Done" : "Soon";
  return (
    <span style={{
      fontSize: 9, padding: "2px 6px", borderRadius: 20,
      background: `${color}33`, color, border: `1px solid ${color}66`,
      fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}

function InfoChip({ icon, text, theme: t, highlight }) {
  return (
    <span style={{
      fontSize: 12,
      color: highlight ? t.accent : `${t.white}bb`,
      fontWeight: highlight ? 700 : 400,
      display: "flex", alignItems: "center", gap: 4,
    }}>
      {icon} {text}
    </span>
  );
}

function TournamentMenu({ tournaments, active, onSelect, onClose }) {
  useEffect(() => {
    const close = () => onClose();
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [onClose]);

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "absolute", top: "calc(100% + 6px)", right: 0,
        background: "#1a1a1a",
        border: "1px solid #444",
        borderRadius: 12, padding: 8, minWidth: 220,
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        zIndex: 200,
      }}
    >
      {tournaments.map(tr => (
        <button
          key={tr.id}
          onClick={() => onSelect(tr)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: "10px 14px",
            background: active.id === tr.id ? "rgba(255,255,255,0.08)" : "transparent",
            border: "none", borderRadius: 8,
            color: "#ddd", fontSize: 13,
            cursor: tr.status === "upcoming" ? "pointer" : "pointer",
            textAlign: "left",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = active.id === tr.id ? "rgba(255,255,255,0.08)" : "transparent"}
        >
          <span>{tr.theme.emoji} {tr.name} {tr.year}</span>
          <StatusDot status={tr.status} />
        </button>
      ))}
    </div>
  );
}

function UpcomingTournament({ tournament, theme: t }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 440, textAlign: "center", gap: 16,
      padding: "40px 20px",
    }}>
      <div style={{ fontSize: 64 }}>{t.emoji}</div>
      <h2 style={{ margin: 0, fontSize: 28, color: t.white }}>
        {tournament.name} {tournament.year}
      </h2>
      <p style={{ margin: 0, color: t.textDim, fontSize: 15 }}>
        {tournament.dates} · {tournament.location} · {tournament.surface}
      </p>
      <div style={{
        marginTop: 8, padding: "12px 28px",
        background: `${t.primary}22`, border: `1px solid ${t.primary}55`,
        borderRadius: 10, fontSize: 14, color: t.text, lineHeight: 1.7,
        maxWidth: 420,
      }}>
        The draw hasn't been released yet. Check back closer to the tournament start date.
        Once the draw is out, picks will open immediately.
      </div>
      <p style={{ color: t.textDim, fontSize: 13 }}>
        In the meantime, make your picks for the <strong style={{ color: t.text }}>French Open 2026</strong> — it's live now!
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#888", fontSize: 18,
    }}>
      🎾 Loading…
    </div>
  );
}
