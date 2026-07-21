/* ============================================================
   sports.js — live, date-aware FC Barcelona + Ferrari F1 data
   Sources (all free, tried in order):
   - Netlify proxy for football-data.org (only if deployed)
   - TheSportsDB (no key, CORS-open): latest result + fixtures
   - Jolpica / Ergast (no key, CORS-open): F1 results, schedule,
     standings
   Static HTML text stays as the last-resort fallback.
   ============================================================ */

const SPORTS_PROXY = '/.netlify/functions/sports';
const BARCA_FD_ID = 81;      // football-data.org team id
const BARCA_TSDB_ID = 133739; // TheSportsDB team id
const TSDB = 'https://www.thesportsdb.com/api/v1/json/3';
const JOLPICA = 'https://api.jolpi.ca/ergast/f1';

function fmtDate(iso) {
  // Date-only strings must be parsed as local time, not UTC midnight,
  // or the displayed day shifts back one in western timezones
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function fetchJSON(url, retry = true) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    // One retry for transient network hiccups / rate limits, but not
    // for HTTP errors like the proxy's expected 404 on GitHub Pages
    if (retry && !/^HTTP /.test(e.message)) {
      await new Promise(r => setTimeout(r, 2000));
      return fetchJSON(url, false);
    }
    console.warn(`sports fetch failed (${url}):`, e.message);
    return null;
  }
}

const proxyFetch = type => fetchJSON(`${SPORTS_PROXY}?type=${type}`);

function renderResultCard(cardId, homeName, awayName, homeGoals, awayGoals, dateText) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const h = Number(homeGoals);
  const a = Number(awayGoals);
  card.querySelector('.hobby-result-score').innerHTML =
    `<span class="hobby-result-team ${h > a ? 'hobby-result-winner' : ''}">${homeName}</span>
     <span class="hobby-result-nums">${h} – <strong>${a}</strong></span>
     <span class="hobby-result-team ${a > h ? 'hobby-result-winner' : ''}">${awayName}</span>`;
  card.querySelector('.hobby-result-date').textContent = dateText;
}

function renderUpcomingList(el, fixtures) {
  if (!el || !fixtures.length) return;
  el.innerHTML = fixtures.map(f => `
    <p class="hobby-next-text">
      ${f.home} <span style="opacity:0.5">vs</span> ${f.away} · ${f.date}
      ${f.league ? `<span class="hobby-next-league">${f.league}</span>` : ''}
    </p>`).join('');
}

/* ── Barcelona ── */

async function barcelonaFromProxy() {
  const [recentData, nextData] = await Promise.all([
    proxyFetch('barcelona_recent'),
    proxyFetch('barcelona_next'),
  ]);
  if (!recentData?.matches) return false;

  const matches = recentData.matches;
  const laLiga = matches.filter(m => m.competition.code === 'PD').slice(-1)[0];
  const ucl = matches.filter(m => m.competition.code === 'CL').slice(-1)[0];

  if (laLiga) {
    renderResultCard('soccer-ll-result',
      laLiga.homeTeam.name, laLiga.awayTeam.name,
      laLiga.score.fullTime.home, laLiga.score.fullTime.away,
      fmtDate(laLiga.utcDate));
  }

  const uclCard = document.getElementById('soccer-ucl-result');
  if (uclCard && ucl) {
    uclCard.style.display = '';
    renderResultCard('soccer-ucl-result',
      ucl.homeTeam.name, ucl.awayTeam.name,
      ucl.score.fullTime.home, ucl.score.fullTime.away,
      fmtDate(ucl.utcDate) + (ucl.stage ? ` · ${ucl.stage.replace(/_/g, ' ')}` : ''));
    const aggEl = document.getElementById('ucl-aggregate');
    if (aggEl && ucl.score.aggregateHome != null && ucl.score.aggregateAway != null) {
      aggEl.textContent = `Aggregate: ${ucl.score.aggregateHome} – ${ucl.score.aggregateAway}`;
      aggEl.style.display = '';
    }
  }

  const upcoming = (nextData?.matches || []).slice(0, 2).map(m => ({
    home: m.homeTeam.id === BARCA_FD_ID ? 'FC Barcelona' : m.homeTeam.name,
    away: m.awayTeam.id === BARCA_FD_ID ? 'FC Barcelona' : m.awayTeam.name,
    date: fmtDate(m.utcDate),
    league: m.competition?.name || '',
  }));
  renderUpcomingList(document.getElementById('soccer-upcoming-list'), upcoming);
  return true;
}

async function barcelonaFromTSDB() {
  const [lastData, nextData] = await Promise.all([
    fetchJSON(`${TSDB}/eventslast.php?id=${BARCA_TSDB_ID}`),
    fetchJSON(`${TSDB}/eventsnext.php?id=${BARCA_TSDB_ID}`),
  ]);

  const played = (lastData?.results || []).filter(e => e.intHomeScore != null);
  const laLiga = played.find(e => /la liga/i.test(e.strLeague || ''));
  const ucl = played.find(e => /champions league/i.test(e.strLeague || ''));

  if (laLiga) {
    renderResultCard('soccer-ll-result',
      laLiga.strHomeTeam, laLiga.strAwayTeam,
      laLiga.intHomeScore, laLiga.intAwayScore,
      fmtDate(laLiga.dateEvent));
  }

  const uclCard = document.getElementById('soccer-ucl-result');
  if (uclCard && ucl) {
    uclCard.style.display = '';
    renderResultCard('soccer-ucl-result',
      ucl.strHomeTeam, ucl.strAwayTeam,
      ucl.intHomeScore, ucl.intAwayScore,
      fmtDate(ucl.dateEvent) + (ucl.strStage ? ` · ${ucl.strStage}` : ''));
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (nextData?.events || [])
    .filter(e => e.dateEvent >= today)
    .slice(0, 2)
    .map(e => ({
      home: e.strHomeTeam,
      away: e.strAwayTeam,
      date: fmtDate(e.dateEvent),
      league: e.strLeague || '',
    }));
  renderUpcomingList(document.getElementById('soccer-upcoming-list'), upcoming);
  return played.length > 0 || upcoming.length > 0;
}

async function updateBarcelona() {
  const ok = await barcelonaFromProxy();
  if (!ok) await barcelonaFromTSDB();
}

/* ── Ferrari F1 ── */

async function updateFerrari() {
  let [raceData, standData, schedData] = await Promise.all([
    proxyFetch('f1_results'),
    proxyFetch('f1_standings'),
    fetchJSON(`${JOLPICA}/current.json`),
  ]);
  if (!raceData) raceData = await fetchJSON(`${JOLPICA}/current/last/results.json`);
  if (!standData) standData = await fetchJSON(`${JOLPICA}/current/constructorstandings.json`);

  // Latest race result
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

  // Next two races from the season schedule (date-aware)
  const races = schedData?.MRData?.RaceTable?.Races || [];
  const now = new Date();
  const upcoming = races
    .filter(r => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now)
    .slice(0, 2);
  if (upcoming.length) {
    const card = document.getElementById('f1-next-card');
    const list = document.getElementById('f1-next-list');
    if (card && list) {
      card.style.display = '';
      list.innerHTML = upcoming.map(r => `
        <p class="hobby-next-text">
          ${r.raceName} <span style="opacity:0.6">· ${r.Circuit?.Location?.country || ''}</span> · ${fmtDate(r.date)}
          <span class="hobby-next-league">Round ${r.round}</span>
        </p>`).join('');
    }
  }

  // Constructor standing
  const table = standData?.MRData?.StandingsTable;
  const standings = table?.StandingsLists?.[0]?.ConstructorStandings || [];
  const ferrari = standings.find(s => s.Constructor.name === 'Ferrari');
  const standEl = document.getElementById('f1-constructor-standing');
  const seasonEl = document.getElementById('f1-season-label');
  if (ferrari && standEl) {
    standEl.textContent = `P${ferrari.position} in Constructors · ${ferrari.points} pts · ${ferrari.wins} wins`;
    if (seasonEl && table?.season) seasonEl.textContent = `${table.season} Season`;
  } else if (standEl) {
    standEl.textContent = 'Forza Ferrari, sempre.';
  }
}

export function initSports() {
  Promise.allSettled([updateBarcelona(), updateFerrari()]);
}
