// src/lib/draws.js
// Last updated: Wimbledon 2026 R1 draw

export const TOURNAMENTS = [
  {
    id: "french-open-2026",
    name: "French Open", year: 2026, surface: "Clay",
    dates: "May 24 – June 7, 2026", location: "Paris, France", status: "complete",
    theme: {
      primary: "#c1440e", primaryDark: "#8b2e07", primaryLight: "#e8602a",
      accent: "#f0a030", bg: "#1a0a05", surface: "#2a1208", card: "#1e0e06",
      border: "#5a3020", text: "#e8d5a3", textDim: "#9a7055", white: "#fdf8f0", emoji: "🎾",
    },
  },
  {
    id: "wimbledon-2026",
    name: "Wimbledon", year: 2026, surface: "Grass",
    dates: "June 30 – July 13, 2026", location: "London, England", status: "live",
    theme: {
      primary: "#2d6a2d", primaryDark: "#1a4a1a", primaryLight: "#4a8f4a",
      accent: "#9b59b6", bg: "#080f08", surface: "#0f1f0f", card: "#0c180c",
      border: "#2d5a2d", text: "#c8e6c8", textDim: "#6a9a6a", white: "#f0faf0", emoji: "🌿",
    },
  },
  {
    id: "us-open-2026",
    name: "US Open", year: 2026, surface: "Hard",
    dates: "Aug 31 – Sep 13, 2026", location: "New York, USA", status: "upcoming",
    theme: {
      primary: "#002b7f", primaryDark: "#001a55", primaryLight: "#0040bf",
      accent: "#e8c830", bg: "#05080f", surface: "#0a1020", card: "#080d1a",
      border: "#1a2a50", text: "#c8d8f0", textDim: "#5a7a9a", white: "#f0f5ff", emoji: "🇺🇸",
    },
  },
  {
    id: "australian-open-2027",
    name: "Australian Open", year: 2027, surface: "Hard",
    dates: "Jan 18 – Feb 1, 2027", location: "Melbourne, Australia", status: "upcoming",
    theme: {
      primary: "#0057a8", primaryDark: "#003d7a", primaryLight: "#1a70c8",
      accent: "#f0c020", bg: "#030810", surface: "#080f1e", card: "#060c18",
      border: "#1a2a45", text: "#c0d8f8", textDim: "#4a6a8a", white: "#f0f8ff", emoji: "🦘",
    },
  },
];

export const ROUND_POINTS = { R128: 10, R64: 20, R32: 40, R16: 80, QF: 160, SF: 320, F: 640 };
export const ROUNDS = ["R128", "R64", "R32", "R16", "QF", "SF", "F"];
export const ROUND_LABELS = {
  R128: "1st Round", R64: "2nd Round", R32: "3rd Round",
  R16: "Round of 16", QF: "Quarterfinals", SF: "Semifinals", F: "Final",
};

// ─── WIMBLEDON 2026 — R1 DRAW ─────────────────────────────────────────────────
const W2026_R1 = [
  // ── TOP HALF (matches 1–32) ───────────────────────────────
  { id: 1,  p1: "J. Sinner [1]",             p2: "M. Kecmanovic",            status: "upcoming", winner: null },
  { id: 2,  p1: "N. Borges",                 p2: "T. Boyer (Q)",             status: "upcoming", winner: null },
  { id: 3,  p1: "A. Vukic",                  p2: "J. Brooksby",              status: "upcoming", winner: null },
  { id: 4,  p1: "E. Nava",                   p2: "I. Buse [31]",             status: "upcoming", winner: null },
  { id: 5,  p1: "R. Jodar [23]",             p2: "F. Gill (WC)",             status: "upcoming", winner: null },
  { id: 6,  p1: "D. Shapovalov",             p2: "P. Carreno Busta",         status: "upcoming", winner: null },
  { id: 7,  p1: "S. Mochizuki (Q)",          p2: "M. Basing (Q)",            status: "upcoming", winner: null },
  { id: 8,  p1: "E. Quinn",                  p2: "L. Darderi [14]",          status: "upcoming", winner: null },
  { id: 9,  p1: "C. Ruud [11]",              p2: "H. Hurkacz",               status: "upcoming", winner: null },
  { id: 10, p1: "H. Medjedovic",             p2: "S. Ofner",                 status: "upcoming", winner: null },
  { id: 11, p1: "S. Kwon (Q)",               p2: "M. Landaluce",             status: "upcoming", winner: null },
  { id: 12, p1: "A. Muller",                 p2: "T. Paul [21]",             status: "upcoming", winner: null },
  { id: 13, p1: "B. Nakashima [28]",         p2: "J. Pinnington Jones (WC)", status: "upcoming", winner: null },
  { id: 14, p1: "J. Struff",                 p2: "S. Baez",                  status: "upcoming", winner: null },
  { id: 15, p1: "C. Ugo Carabelli",          p2: "D. Merida",                status: "upcoming", winner: null },
  { id: 16, p1: "M. Cilic",                  p2: "D. Medvedev [8]",          status: "upcoming", winner: null },
  { id: 17, p1: "F. Auger-Aliassime [3]",    p2: "A. Shevchenko",            status: "upcoming", winner: null },
  { id: 18, p1: "A. Walton",                 p2: "D. Prizmic",               status: "upcoming", winner: null },
  { id: 19, p1: "A. Vallejo",                p2: "N. Mejia (Q)",             status: "upcoming", winner: null },
  { id: 20, p1: "M. Zheng (Q)",              p2: "C. Norrie [26]",           status: "upcoming", winner: null },
  { id: 21, p1: "A. Davidovich Fokina [22]", p2: "J. Cerundolo",             status: "upcoming", winner: null },
  { id: 22, p1: "T. Tirante",                p2: "F. Marozsan",              status: "upcoming", winner: null },
  { id: 23, p1: "L. Van Assche",             p2: "M. Fucsovics",             status: "upcoming", winner: null },
  { id: 24, p1: "D. Svrcina",                p2: "L. Tien [16]",             status: "upcoming", winner: null },
  { id: 25, p1: "A. Rublev [12]",            p2: "R. Safiullin (Q)",         status: "upcoming", winner: null },
  { id: 26, p1: "A. Kovacevic",              p2: "B. Van de Zandschulp",     status: "upcoming", winner: null },
  { id: 27, p1: "J. De Jong",                p2: "R. Hijikata",              status: "upcoming", winner: null },
  { id: 28, p1: "R. Bautista Agut",          p2: "J. Fonseca [24]",          status: "upcoming", winner: null },
  { id: 29, p1: "A. Rinderknech [25]",       p2: "O. Tarvet (Q)",            status: "upcoming", winner: null },
  { id: 30, p1: "M. Trungelliti",            p2: "M. Damm Jr",               status: "upcoming", winner: null },
  { id: 31, p1: "H. Gaston (Q)",             p2: "S. Tsitsipas",             status: "upcoming", winner: null },
  { id: 32, p1: "Y. Wu",                     p2: "N. Djokovic [7]",          status: "upcoming", winner: null },
  // ── BOTTOM HALF (matches 33–64) ──────────────────────────
  { id: 33, p1: "A. de Minaur [5]",          p2: "R. Burruchaga",            status: "upcoming", winner: null },
  { id: 34, p1: "A. Mannarino",              p2: "T. Droguet",               status: "upcoming", winner: null },
  { id: 35, p1: "M. Bellucci",               p2: "Z. Svajda",                status: "upcoming", winner: null },
  { id: 36, p1: "K. Majchrzak",              p2: "A. Tabilo [30]",           status: "upcoming", winner: null },
  { id: 37, p1: "K. Khachanov [19]",         p2: "B. Harris (Q)",            status: "upcoming", winner: null },
  { id: 38, p1: "Y. Hanfmann",               p2: "G. Mpetshi Perricard",     status: "upcoming", winner: null },
  { id: 39, p1: "T. Griekspoor",             p2: "J. Duckworth",             status: "upcoming", winner: null },
  { id: 40, p1: "M. Navone",                 p2: "F. Cobolli [9]",           status: "upcoming", winner: null },
  { id: 41, p1: "J. Mensik [15]",            p2: "T. Samuel (WC)",           status: "upcoming", winner: null },
  { id: 42, p1: "D. Sweeny (Q)",             p2: "G. Dimitrov (WC)",         status: "upcoming", winner: null },
  { id: 43, p1: "S. Wawrinka (WC)",          p2: "M. Berrettini",            status: "upcoming", winner: null },
  { id: 44, p1: "R. Collignon",              p2: "A. Fils [20]",             status: "upcoming", winner: null },
  { id: 45, p1: "U. Humbert [27]",           p2: "Z. Bergs",                 status: "upcoming", winner: null },
  { id: 46, p1: "S. Shimabukuro",            p2: "J. Faria (Q)",             status: "upcoming", winner: null },
  { id: 47, p1: "D. Dzumhur",                p2: "A. Fery (WC)",             status: "upcoming", winner: null },
  { id: 48, p1: "O. Virtanen (Q)",           p2: "B. Shelton [4]",           status: "upcoming", winner: null },
  { id: 49, p1: "T. Fritz [6]",              p2: "J. Draper",                status: "upcoming", winner: null },
  { id: 50, p1: "P. Kypson",                 p2: "M. McDonald (Q)",          status: "upcoming", winner: null },
  { id: 51, p1: "B. Bonzi",                  p2: "G. Diallo",                status: "upcoming", winner: null },
  { id: 52, p1: "L. Sonego",                 p2: "T. Etcheverry [29]",       status: "upcoming", winner: null },
  { id: 53, p1: "F. Tiafoe [17]",            p2: "T. Atmane",                status: "upcoming", winner: null },
  { id: 54, p1: "V. Kopriva",                p2: "J. Choinski",              status: "upcoming", winner: null },
  { id: 55, p1: "K. Jacquet (Q)",            p2: "V. Gaubas (Q)",            status: "upcoming", winner: null },
  { id: 56, p1: "T. Kokkinakis",             p2: "A. Bublik [10]",           status: "upcoming", winner: null },
  { id: 57, p1: "J. Lehecka [13]",           p2: "A. Popyrin",               status: "upcoming", winner: null },
  { id: 58, p1: "A. Molcan",                 p2: "D. Altmaier",              status: "upcoming", winner: null },
  { id: 59, p1: "A. Michelsen",              p2: "J. Fearnley (WC)",         status: "upcoming", winner: null },
  { id: 60, p1: "J. Munar",                  p2: "F. Cerundolo [18]",        status: "upcoming", winner: null },
  { id: 61, p1: "M. Arnaldi [32]",           p2: "Q. Halys",                 status: "upcoming", winner: null },
  { id: 62, p1: "C. Moutet",                 p2: "M. Giron",                 status: "upcoming", winner: null },
  { id: 63, p1: "V. Royer",                  p2: "H. Wendelken (WC)",        status: "upcoming", winner: null },
  { id: 64, p1: "A. Blockx",                 p2: "A. Zverev [2]",            status: "upcoming", winner: null },
];

export const DRAWS = {
  "french-open-2026": {
    R128: [], R64: [], R32: [], R16: [], QF: [], SF: [], F: [],
  },
  "wimbledon-2026": {
    R128: W2026_R1,
    R64:  [], R32:  [], R16:  [], QF:   [], SF:   [], F:    [],
  },
  "us-open-2026": null,
  "australian-open-2027": null,
};
