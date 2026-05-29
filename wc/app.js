// ---------------------------------------------------------------------------
// World Cup 2026 prediction pool — state, rendering, persistence, sharing.
// Depends on data.js (GROUPS, GROUP_LETTERS, TEAMS, R32, KO, ROUND_LABELS, slug).
// ---------------------------------------------------------------------------

const STORAGE_KEY = "wc2026-picks";

// The single source of truth for what the user has predicted.
//   groups:   { A: [id,id,id], ... }  ordered 1st,2nd,3rd (4th is implied)
//   thirds:   [groupLetter, ...]       up to 8 groups whose 3rd-placed team advances
//   knockout: { matchId: winningTeamId }
let picks = emptyPicks();
let friendPicks = null;

function emptyPicks() {
  return { groups: {}, thirds: [], knockout: {} };
}

// --- tiny DOM helper ---------------------------------------------------------
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, "");
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return n;
}

const teamText = (id) => (id ? `${TEAMS[id].flag} ${TEAMS[id].name}` : "—");

// ---------------------------------------------------------------------------
// Core: resolve picks into a concrete bracket, pruning anything now invalid.
// Mutates the passed picks object (drops stale thirds / knockout winners).
// ---------------------------------------------------------------------------
function resolve(p) {
  const gr = {};
  for (const L of GROUP_LETTERS) {
    const order = p.groups[L] || [];
    gr[L] = { w: order[0] || null, ru: order[1] || null, third: order[2] || null, complete: order.length >= 3 };
  }

  // a third can only qualify if its group is fully ranked; never more than 8
  p.thirds = p.thirds.filter((L) => gr[L] && gr[L].complete);
  if (p.thirds.length > 8) p.thirds = p.thirds.slice(0, 8);

  // simplified slotting rule: qualifying thirds sorted by group letter fill the 8 slots
  const sortedThirds = [...p.thirds].sort();
  const thirdSlots = [];
  for (let i = 0; i < 8; i++) thirdSlots[i] = sortedThirds[i] ? gr[sortedThirds[i]].third : null;

  const matches = {};
  const slotResolve = (slot) => {
    if (slot.m !== undefined) {
      const sm = matches[slot.m];
      if (!sm) return null;
      return slot.r === "W" ? sm.winner : sm.loser;
    }
    if (slot.t === "W") return gr[slot.g].w;
    if (slot.t === "RU") return gr[slot.g].ru;
    if (slot.t === "3") return thirdSlots[slot.i];
    return null;
  };

  // process every match in ascending id order so each only depends on earlier ones
  for (const m of [...R32, ...KO]) {
    const a = slotResolve(m.a);
    const b = slotResolve(m.b);
    let w = p.knockout[m.id] || null;
    if (w && w !== a && w !== b) {
      delete p.knockout[m.id]; // upstream changed, this pick no longer makes sense
      w = null;
    }
    const loser = w ? (w === a ? b : a) : null;
    matches[m.id] = { a, b, winner: w, loser };
  }

  return { gr, thirds: thirdSlots, matches };
}

const groupsComplete = () => GROUP_LETTERS.every((L) => (picks.groups[L] || []).length >= 3);

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function renderAll() {
  const res = resolve(picks); // also normalises picks in place
  renderGroups(res);
  renderThirds(res);
  renderBracket(res);
  save();
}

function renderGroups(res) {
  const host = document.getElementById("groups");
  host.replaceChildren();
  for (const L of GROUP_LETTERS) {
    const order = picks.groups[L] || [];
    const rows = GROUPS[L].map(([name, flag]) => {
      const id = slug(name);
      const idx = order.indexOf(id);
      let rank = idx >= 0 ? idx + 1 : null;
      if (rank === null && order.length === 3) rank = 4; // last one standing
      const cls = "team-row" + (rank ? " r" + rank : "");
      return el("div", { class: cls, onclick: () => clickGroupTeam(L, id) },
        el("span", { class: "flag" }, flag),
        el("span", { class: "name" }, name),
        el("span", { class: "rank" }, rank ? String(rank) : ""));
    });
    host.append(el("div", { class: "group-card" },
      el("header", {},
        el("h3", {}, "Group " + L),
        el("button", { class: "reset-group", onclick: () => { picks.groups[L] = []; renderAll(); } }, "reset")),
      ...rows));
  }
}

function clickGroupTeam(L, id) {
  let order = picks.groups[L] ? [...picks.groups[L]] : [];
  const idx = order.indexOf(id);
  if (idx >= 0) order = order.slice(0, idx); // clicking a ranked team clears it and below
  else if (order.length < 3) order.push(id);
  picks.groups[L] = order;
  renderAll();
}

function renderThirds(res) {
  const host = document.getElementById("thirds");
  const counter = document.getElementById("thirds-counter");
  host.replaceChildren();

  if (!groupsComplete()) {
    counter.textContent = "";
    const done = GROUP_LETTERS.filter((L) => (picks.groups[L] || []).length >= 3).length;
    host.append(el("p", { class: "locked" }, `Rank all 12 groups first (${done}/12 done) to choose the qualifying thirds.`));
    return;
  }

  counter.textContent = `${picks.thirds.length}/8 selected`;
  const full = picks.thirds.length >= 8;
  for (const L of GROUP_LETTERS) {
    const thirdId = (picks.groups[L] || [])[2];
    const on = picks.thirds.includes(L);
    const disabled = !on && full;
    const cls = "third-chip" + (on ? " on" : "") + (disabled ? " disabled" : "");
    host.append(el("label", { class: cls },
      el("input", { type: "checkbox", checked: on, disabled, onchange: () => toggleThird(L) }),
      el("span", { class: "flag" }, TEAMS[thirdId].flag),
      el("span", {}, `${TEAMS[thirdId].name} (3rd ${L})`)));
  }
}

function toggleThird(L) {
  const i = picks.thirds.indexOf(L);
  if (i >= 0) picks.thirds.splice(i, 1);
  else if (picks.thirds.length < 8) picks.thirds.push(L);
  renderAll();
}

function renderBracket(res) {
  const host = document.getElementById("bracket");
  const banner = document.getElementById("champion-banner");
  host.replaceChildren();

  if (picks.thirds.length < 8) {
    banner.hidden = true;
    host.append(el("p", { class: "locked" }, "Finish the group standings and pick all 8 thirds to unlock the knockout bracket."));
    return;
  }

  const champ = res.matches[104].winner;
  banner.hidden = !champ;
  if (champ) banner.textContent = `🏆 Your champion: ${teamText(champ)}`;

  // overlay that the connector lines are drawn into, behind the cards
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "connectors");
  host.append(svg);

  const columns = [
    ["Round of 32", R32],
    ["Round of 16", KO.filter((m) => m.round === "R16")],
    ["Quarter-finals", KO.filter((m) => m.round === "QF")],
    ["Semi-finals", KO.filter((m) => m.round === "SF")],
    ["Final", KO.filter((m) => m.round === "Final")],
  ];

  // FIFA's match numbers aren't in tree order, so each match's vertical position
  // must follow the bracket geometry instead. Walk the tree from the Final to get
  // the R32 matches in true top-to-bottom order, then place every later match at
  // the midpoint of its two feeders. Sorting each column by this keeps lines from
  // crossing and lands every match directly across from the ties that feed it.
  const koById = {};
  for (const m of KO) koById[m.id] = m;
  const leafSeq = [];
  (function collectLeaves(id) {
    const m = koById[id];
    if (m) { collectLeaves(m.a.m); collectLeaves(m.b.m); }
    else leafSeq.push(id); // an R32 match
  })(104);
  const leafIndex = {};
  leafSeq.forEach((id, i) => (leafIndex[id] = i));
  const posOf = (id) => {
    const m = koById[id];
    return m ? (posOf(m.a.m) + posOf(m.b.m)) / 2 : leafIndex[id];
  };

  for (const [label, list] of columns) {
    const ordered = [...list].sort((x, y) => posOf(x.id) - posOf(y.id));
    const matchesWrap = el("div", { class: "col-matches" });
    for (const m of ordered) matchesWrap.append(matchEl(m.id, res));
    host.append(el("div", { class: "round-col" }, el("h4", {}, label), matchesWrap));
  }

  // third-place match lives in its own little block beneath the main bracket
  const tp = KO.find((m) => m.round === "3rd");
  host.append(el("div", { class: "third-place-wrap" },
    el("h4", {}, "Third place"),
    matchEl(tp.id, res)));

  // draw connectors once the cards have been laid out
  requestAnimationFrame(drawConnectors);
}

// Draw elbow connectors from each match to the two ties that feed it, measuring
// the rendered card positions so it stays correct at any width. A line is shown
// in the accent colour when a team has actually advanced along it.
function drawConnectors() {
  const host = document.getElementById("bracket");
  const svg = host.querySelector("svg.connectors");
  if (!svg) return;
  svg.replaceChildren();
  svg.setAttribute("width", host.scrollWidth);
  svg.setAttribute("height", host.scrollHeight);
  const box = svg.getBoundingClientRect();
  const geo = (node) => {
    const r = node.getBoundingClientRect();
    return { left: r.left - box.left, right: r.right - box.left, cy: r.top - box.top + r.height / 2 };
  };
  const NS = "http://www.w3.org/2000/svg";
  const line = (x1, y1, x2, y2, accent) => {
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1);
    l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    l.setAttribute("class", accent ? "conn accent" : "conn");
    svg.append(l);
  };
  for (const m of KO) {
    if (m.round === "3rd") continue; // third-place game is off to the side
    const tEl = host.querySelector(`[data-m="${m.id}"]`);
    const aEl = host.querySelector(`[data-m="${m.a.m}"]`);
    const bEl = host.querySelector(`[data-m="${m.b.m}"]`);
    if (!tEl || !aEl || !bEl) continue;
    const T = geo(tEl), A = geo(aEl), B = geo(bEl);
    const midX = (A.right + T.left) / 2;
    const aWon = !!aEl.querySelector(".slot.won"); // a team has advanced from this feeder
    const bWon = !!bEl.querySelector(".slot.won");
    line(A.right, A.cy, midX, A.cy, aWon);     // stub out of upper feeder
    line(B.right, B.cy, midX, B.cy, bWon);     // stub out of lower feeder
    line(midX, A.cy, midX, B.cy, false);       // vertical join
    line(midX, T.cy, T.left, T.cy, aWon || bWon); // stub into the next match
  }
}

function matchEl(id, res) {
  const m = res.matches[id];
  const slot = (teamId) => {
    const tbd = !teamId;
    const won = teamId && teamId === m.winner;
    return el("div", { class: "slot" + (tbd ? " tbd" : "") + (won ? " won" : ""), onclick: tbd ? null : () => pickWinner(id, teamId) },
      tbd ? el("span", { class: "name" }, "TBD")
          : [el("span", { class: "flag" }, TEAMS[teamId].flag), el("span", { class: "name" }, TEAMS[teamId].name)]);
  };
  return el("div", { class: "match", "data-m": id }, slot(m.a), slot(m.b));
}

function pickWinner(matchId, teamId) {
  if (picks.knockout[matchId] === teamId) delete picks.knockout[matchId]; // click winner again to clear
  else picks.knockout[matchId] = teamId;
  renderAll();
}

// ---------------------------------------------------------------------------
// Persistence + share codes
// ---------------------------------------------------------------------------
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
}

function encode(p) {
  const json = JSON.stringify({ g: p.groups, t: p.thirds, k: p.knockout });
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(code) {
  try {
    let b64 = code.trim().replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const o = JSON.parse(decodeURIComponent(escape(atob(b64))));
    return { groups: o.g || {}, thirds: o.t || [], knockout: o.k || {} };
  } catch (e) {
    return null;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // clipboard API is often blocked on file:// — fall back to a temp textarea
    const ta = el("textarea", {});
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) {}
    ta.remove();
    return ok;
  }
}

function status(msg) {
  const s = document.getElementById("share-status");
  s.textContent = msg;
  clearTimeout(status._t);
  status._t = setTimeout(() => { s.textContent = ""; }, 4000);
}

// ---------------------------------------------------------------------------
// Compare: you vs a friend's pasted code
// ---------------------------------------------------------------------------
function runCompare() {
  const code = document.getElementById("friend-code").value;
  const decoded = decode(code);
  if (!decoded) { status("That code didn't decode — check you copied all of it."); return; }
  friendPicks = decoded;
  const mine = resolve(picks);
  const theirs = resolve(friendPicks);
  renderCompare(mine, theirs);
  document.getElementById("compare-section").hidden = false;
  document.getElementById("clear-compare").hidden = false;
  document.getElementById("compare-section").scrollIntoView({ behavior: "smooth" });
}

function clearCompare() {
  friendPicks = null;
  document.getElementById("compare-section").hidden = true;
  document.getElementById("clear-compare").hidden = true;
  document.getElementById("friend-code").value = "";
  document.getElementById("compare-output").replaceChildren();
}

function winnersOf(res, ids) {
  return ids.map((id) => res.matches[id].winner).filter(Boolean);
}
const overlap = (a, b) => a.filter((x) => b.includes(x)).length;

function renderCompare(mine, theirs) {
  const out = document.getElementById("compare-output");
  out.replaceChildren();

  // 1. Group standings
  const gCard = el("div", { class: "compare-card" }, el("h3", {}, "Group standings"));
  let winAgree = 0, topTwoAgree = 0;
  gCard.append(el("div", { class: "compare-row" },
    el("span", { class: "label" }, "Group"), el("span", { class: "label" }, "You (1st / 2nd)"), el("span", { class: "label" }, "Friend (1st / 2nd)")));
  for (const L of GROUP_LETTERS) {
    const mo = mine.gr[L], to = theirs.gr[L];
    const sameWin = mo.w && mo.w === to.w;
    const sameTop2 = sameWin && mo.ru === to.ru;
    if (sameWin) winAgree++;
    if (sameTop2) topTwoAgree++;
    gCard.append(el("div", { class: "compare-row " + (sameTop2 ? "agree" : sameWin ? "" : "disagree") },
      el("span", {}, "Group " + L),
      el("span", {}, `${teamText(mo.w)} / ${teamText(mo.ru)}`),
      el("span", {}, `${teamText(to.w)} / ${teamText(to.ru)}`)));
  }
  gCard.append(el("p", {}, el("span", { class: "score-pill" }, `Same winner: ${winAgree}/12`), " ",
    el("span", { class: "score-pill" }, `Exact top-2: ${topTwoAgree}/12`)));
  out.append(gCard);

  // 2. Thirds
  const myThirds = mine.thirds.filter(Boolean);
  const theirThirds = theirs.thirds.filter(Boolean);
  out.append(el("div", { class: "compare-card" },
    el("h3", {}, "Best thirds"),
    el("div", { class: "compare-row" },
      el("span", { class: "label" }, "Yours"), el("span", { class: "label" }, "Friend's"), el("span", { class: "label" }, "In common")),
    el("div", { class: "compare-row" },
      el("span", {}, myThirds.map(teamText).join(", ") || "—"),
      el("span", {}, theirThirds.map(teamText).join(", ") || "—"),
      el("span", { class: "score-pill" }, `${overlap(myThirds, theirThirds)}/8`))));

  // 3. Knockout progression — overlap of teams reaching each stage
  const stages = [
    ["Reached Round of 16", range(73, 88)],
    ["Reached Quarter-finals", range(89, 96)],
    ["Reached Semi-finals", range(97, 100)],
    ["Reached Final", [101, 102]],
  ];
  const kCard = el("div", { class: "compare-card" }, el("h3", {}, "Knockout progression"));
  for (const [label, ids] of stages) {
    const mineW = winnersOf(mine, ids), theirsW = winnersOf(theirs, ids);
    kCard.append(el("div", { class: "compare-row" },
      el("span", { class: "label" }, label),
      el("span", {}, `you ${mineW.length} · friend ${theirsW.length}`),
      el("span", { class: "score-pill" }, `${overlap(mineW, theirsW)} in common`)));
  }
  const myChamp = mine.matches[104].winner, theirChamp = theirs.matches[104].winner;
  const champAgree = myChamp && myChamp === theirChamp;
  kCard.append(el("div", { class: "compare-row " + (champAgree ? "agree" : myChamp && theirChamp ? "disagree" : "") },
    el("span", { class: "label" }, "🏆 Champion"),
    el("span", {}, teamText(myChamp)),
    el("span", {}, teamText(theirChamp))));
  out.append(kCard);
}

function range(a, b) {
  const r = [];
  for (let i = a; i <= b; i++) r.push(i);
  return r;
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function init() {
  // a shared link (#code) takes precedence and loads that bracket as yours
  const hash = location.hash.slice(1);
  const fromHash = hash ? decode(hash) : null;
  if (fromHash) {
    picks = fromHash;
    history.replaceState(null, "", location.pathname + location.search); // tidy the URL
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && saved.groups) picks = { groups: saved.groups, thirds: saved.thirds || [], knockout: saved.knockout || {} };
    } catch (e) { /* ignore corrupt storage */ }
  }

  document.getElementById("copy-link").addEventListener("click", async () => {
    const url = location.href.split("#")[0] + "#" + encode(picks);
    status((await copyText(url)) ? "Link copied — share it in the group chat." : "Couldn't copy automatically. Here it is: " + url);
  });
  document.getElementById("copy-code").addEventListener("click", async () => {
    const code = encode(picks);
    status((await copyText(code)) ? "Code copied." : "Couldn't copy automatically. Here it is: " + code);
  });
  document.getElementById("reset-all").addEventListener("click", () => {
    if (confirm("Clear all your picks?")) { picks = emptyPicks(); renderAll(); status("Cleared."); }
  });
  document.getElementById("compare-btn").addEventListener("click", runCompare);
  document.getElementById("clear-compare").addEventListener("click", clearCompare);
  window.addEventListener("resize", () => requestAnimationFrame(drawConnectors));

  renderAll();
}

init();
