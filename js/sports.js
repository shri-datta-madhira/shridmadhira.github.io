/* ============================================================
   sports.js — live FC Barcelona + Ferrari F1 data
   - Barcelona: football-data.org via the Netlify proxy (needs
     the proxy deployment; falls back to the static HTML text)
   - Ferrari: Jolpica (Ergast successor) — free, no key, CORS-
     friendly, so we hit it directly if the proxy is missing
   ============================================================ */

const SPORTS_PROXY = '/.netlify/functions/sports';
const BARCA_TEAM_ID = 81;
const JOLPICA = 'https://api.jolpi.ca/ergast/f1';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`sports fetch failed (${url}):`, e.message);
    return null;
  }
}

const proxyFetch = type => fetchJSON(`${SPORTS_PROXY}?type=${type}`);

/* ── Barcelona ── */
async function updateBarcelona() {
  const [recentData, nextData] = await Promise.all([
    proxyFetch('barcelona_recent'),
    proxyFetch('barcelona_next'),
  ]);
  if (!recentData?.matches) return;

  const matches = recentData.matches;
  const laLiga = matches.filter(m => m.competition.code === 'PD').slice(-1)[0];
  const ucl = matches.filter(m => m.competition.code === 'CL').slice(-1)[0];
  const next = nextData?.matches?.[0];

  if (laLiga) {
    const home = laLiga.homeTeam.id === BARCA_TEAM_ID;
    const opp = home ? laLiga.awayTeam.name : laLiga.homeTeam.name;
    const bG = home ? laLiga.score.fullTime.home : laLiga.score.fullTime.away;
    const oG = home ? laLiga.score.fullTime.away : laLiga.score.fullTime.home;
    const card = document.getElementById('soccer-ll-result');
    if (card) {
      card.querySelector('.hobby-result-score').innerHTML =
        `<span class="hobby-result-team ${bG > oG ? 'hobby-result-winner' : ''}">FC Barcelona</span>
         <span class="hobby-result-nums">${bG} – <strong>${oG}</strong></span>
         <span class="hobby-result-team ${oG > bG ? 'hobby-result-winner' : ''}">${opp}</span>`;
      card.querySelector('.hobby-result-date').textContent = fmtDate(laLiga.utcDate);
    }
  }

  const uclCard = document.getElementById('soccer-ucl-result');
  if (uclCard) {
    if (ucl) {
      uclCard.style.display = '';
      document.getElementById('ucl-home-team').textContent = ucl.homeTeam.name;
      document.getElementById('ucl-away-team').textContent = ucl.awayTeam.name;
      document.getElementById('ucl-score').innerHTML =
        `${ucl.score.fullTime.home} – <strong>${ucl.score.fullTime.away}</strong>`;
      document.getElementById('ucl-date').textContent =
        fmtDate(ucl.utcDate) + (ucl.stage ? ` · ${ucl.stage.replace(/_/g, ' ')}` : '');

      const aggEl = document.getElementById('ucl-aggregate');
      if (ucl.score.aggregateHome != null && ucl.score.aggregateAway != null) {
        aggEl.textContent = `Aggregate: ${ucl.score.aggregateHome} – ${ucl.score.aggregateAway}`;
        aggEl.style.display = '';
      }

      const homeG = ucl.score.fullTime.home;
      const awayG = ucl.score.fullTime.away;
      if (homeG > awayG) document.getElementById('ucl-home-team').classList.add('hobby-result-winner');
      else if (awayG > homeG) document.getElementById('ucl-away-team').classList.add('hobby-result-winner');
    } else {
      uclCard.style.display = 'none';
    }
  }

  if (next) {
    const home = next.homeTeam.id === BARCA_TEAM_ID;
    const opp = home ? next.awayTeam.name : next.homeTeam.name;
    const card = document.getElementById('soccer-next');
    if (card) {
      card.querySelector('.hobby-next-text').innerHTML =
        `${home ? 'FC Barcelona' : opp} <span style="opacity:0.5">vs</span> ${home ? opp : 'FC Barcelona'} — ${fmtDate(next.utcDate)}`;
    }
  }
}

/* ── Ferrari F1 ── */
async function updateFerrari() {
  // Proxy first, then direct Jolpica (free + CORS-enabled)
  let raceData = await proxyFetch('f1_results');
  let standData = await proxyFetch('f1_standings');
  if (!raceData) raceData = await fetchJSON(`${JOLPICA}/current/last/results.json`);
  if (!standData) standData = await fetchJSON(`${JOLPICA}/current/constructorstandings.json`);

  const race = raceData?.MRData?.RaceTable?.Races?.[0];
  if (race) {
    const results = race.Results || [];
    const leclerc = results.find(r => r.Driver.familyName === 'Leclerc');
    const hamilton = results.find(r => r.Driver.familyName === 'Hamilton');

    const labelEl = document.getElementById('f1-race-label');
    if (labelEl) labelEl.textContent = `Latest Race · ${race.raceName}`;

    const dateEl = document.getElementById('f1-race-date');
    if (dateEl) dateEl.textContent = fmtDate(race.date);

    const resultsEl = document.getElementById('f1-results');
    if (resultsEl) {
      const rows = [leclerc, hamilton].filter(Boolean).map(d => {
        const pos = parseInt(d.position, 10);
        const cls = pos === 1 ? 'p1' : pos === 2 ? 'p2' : pos === 3 ? 'p3' : 'p-other';
        return `<div class="hobby-f1-row"><span class="hobby-f1-pos ${cls}">P${pos}</span><span>${d.Driver.familyName}</span></div>`;
      }).join('');
      if (rows) resultsEl.innerHTML = rows;
    }
  }

  const standings = standData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
  const ferrari = standings.find(s => s.Constructor.name === 'Ferrari');
  const standEl = document.getElementById('f1-constructor-standing');
  if (ferrari && standEl) {
    standEl.textContent = `P${ferrari.position} in Constructors · ${ferrari.points} pts`;
  }
}

export function initSports() {
  Promise.allSettled([updateBarcelona(), updateFerrari()]);
}
