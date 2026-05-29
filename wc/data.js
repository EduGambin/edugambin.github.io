// Static tournament data for the 2026 World Cup prediction pool.
// Everything here is the confirmed final draw (Dec 2025) plus the official
// knockout bracket template. Edit GROUPS if any drawn team needs correcting.

// 12 groups of 4. Order within a group is just the drawn order, not a prediction.
const GROUPS = {
  A: [["Mexico", "🇲🇽"], ["South Korea", "🇰🇷"], ["South Africa", "🇿🇦"], ["Czechia", "🇨🇿"]],
  B: [["Canada", "🇨🇦"], ["Switzerland", "🇨🇭"], ["Qatar", "🇶🇦"], ["Bosnia-Herzegovina", "🇧🇦"]],
  C: [["Brazil", "🇧🇷"], ["Morocco", "🇲🇦"], ["Scotland", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"], ["Haiti", "🇭🇹"]],
  D: [["USA", "🇺🇸"], ["Paraguay", "🇵🇾"], ["Australia", "🇦🇺"], ["Turkiye", "🇹🇷"]],
  E: [["Germany", "🇩🇪"], ["Ecuador", "🇪🇨"], ["Ivory Coast", "🇨🇮"], ["Curacao", "🇨🇼"]],
  F: [["Netherlands", "🇳🇱"], ["Japan", "🇯🇵"], ["Tunisia", "🇹🇳"], ["Sweden", "🇸🇪"]],
  G: [["Belgium", "🇧🇪"], ["Iran", "🇮🇷"], ["Egypt", "🇪🇬"], ["New Zealand", "🇳🇿"]],
  H: [["Spain", "🇪🇸"], ["Uruguay", "🇺🇾"], ["Saudi Arabia", "🇸🇦"], ["Cape Verde", "🇨🇻"]],
  I: [["France", "🇫🇷"], ["Senegal", "🇸🇳"], ["Norway", "🇳🇴"], ["Iraq", "🇮🇶"]],
  J: [["Argentina", "🇦🇷"], ["Austria", "🇦🇹"], ["Algeria", "🇩🇿"], ["Jordan", "🇯🇴"]],
  K: [["Portugal", "🇵🇹"], ["Colombia", "🇨🇴"], ["Uzbekistan", "🇺🇿"], ["DR Congo", "🇨🇩"]],
  L: [["England", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"], ["Croatia", "🇭🇷"], ["Panama", "🇵🇦"], ["Ghana", "🇬🇭"]],
};

const GROUP_LETTERS = Object.keys(GROUPS);

// stable id from a team name, used everywhere picks are stored
function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Flat lookup: id -> { id, name, flag, group }
const TEAMS = {};
for (const letter of GROUP_LETTERS) {
  for (const [name, flag] of GROUPS[letter]) {
    const id = slug(name);
    TEAMS[id] = { id, name, flag, group: letter };
  }
}

// Round of 32 template. Each slot is one of:
//   { t: "W", g: "E" }    winner of group E
//   { t: "RU", g: "A" }   runner-up of group A
//   { t: "3", i: 0 }      the i-th qualifying third (filled by the sort rule)
const R32 = [
  { id: 73, a: { t: "RU", g: "A" }, b: { t: "RU", g: "B" } },
  { id: 74, a: { t: "W", g: "E" }, b: { t: "3", i: 0 } },
  { id: 75, a: { t: "W", g: "F" }, b: { t: "RU", g: "C" } },
  { id: 76, a: { t: "W", g: "C" }, b: { t: "RU", g: "F" } },
  { id: 77, a: { t: "W", g: "I" }, b: { t: "3", i: 1 } },
  { id: 78, a: { t: "RU", g: "E" }, b: { t: "RU", g: "I" } },
  { id: 79, a: { t: "W", g: "A" }, b: { t: "3", i: 2 } },
  { id: 80, a: { t: "W", g: "L" }, b: { t: "3", i: 3 } },
  { id: 81, a: { t: "W", g: "D" }, b: { t: "3", i: 4 } },
  { id: 82, a: { t: "W", g: "G" }, b: { t: "3", i: 5 } },
  { id: 83, a: { t: "RU", g: "K" }, b: { t: "RU", g: "L" } },
  { id: 84, a: { t: "W", g: "H" }, b: { t: "RU", g: "J" } },
  { id: 85, a: { t: "W", g: "B" }, b: { t: "3", i: 6 } },
  { id: 86, a: { t: "W", g: "J" }, b: { t: "RU", g: "H" } },
  { id: 87, a: { t: "W", g: "K" }, b: { t: "3", i: 7 } },
  { id: 88, a: { t: "RU", g: "D" }, b: { t: "RU", g: "G" } },
];

// Knockout matches that feed off earlier winners (and one loser, the 3rd-place game).
// Each slot is { m: matchId, r: "W" | "L" }.
const KO = [
  { id: 89, round: "R16", a: { m: 74, r: "W" }, b: { m: 77, r: "W" } },
  { id: 90, round: "R16", a: { m: 73, r: "W" }, b: { m: 75, r: "W" } },
  { id: 91, round: "R16", a: { m: 76, r: "W" }, b: { m: 78, r: "W" } },
  { id: 92, round: "R16", a: { m: 79, r: "W" }, b: { m: 80, r: "W" } },
  { id: 93, round: "R16", a: { m: 83, r: "W" }, b: { m: 84, r: "W" } },
  { id: 94, round: "R16", a: { m: 81, r: "W" }, b: { m: 82, r: "W" } },
  { id: 95, round: "R16", a: { m: 86, r: "W" }, b: { m: 88, r: "W" } },
  { id: 96, round: "R16", a: { m: 85, r: "W" }, b: { m: 87, r: "W" } },
  { id: 97, round: "QF", a: { m: 89, r: "W" }, b: { m: 90, r: "W" } },
  { id: 98, round: "QF", a: { m: 93, r: "W" }, b: { m: 94, r: "W" } },
  { id: 99, round: "QF", a: { m: 91, r: "W" }, b: { m: 92, r: "W" } },
  { id: 100, round: "QF", a: { m: 95, r: "W" }, b: { m: 96, r: "W" } },
  { id: 101, round: "SF", a: { m: 97, r: "W" }, b: { m: 98, r: "W" } },
  { id: 102, round: "SF", a: { m: 99, r: "W" }, b: { m: 100, r: "W" } },
  { id: 103, round: "3rd", a: { m: 101, r: "L" }, b: { m: 102, r: "L" } },
  { id: 104, round: "Final", a: { m: 101, r: "W" }, b: { m: 102, r: "W" } },
];

const ROUND_LABELS = { R16: "Round of 16", QF: "Quarter-finals", SF: "Semi-finals", "3rd": "Third place", Final: "Final" };
