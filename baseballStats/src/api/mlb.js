const BASE_URL = 'https://statsapi.mlb.com/api/v1'

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`MLB API error: ${res.status}`)
  return res.json()
}

// Search players by name
export function searchPlayers(name) {
  return get(`/people/search?names=${encodeURIComponent(name)}`)
}

// One player's profile
export function getPlayer(id) {
  return get(`/people/${id}`)
}

// Several players at once, by id
export function getPlayers(ids) {
  return get(`/people?personIds=${ids.join(',')}&hydrate=currentTeam`)
}

// All MLB teams
export function getTeams() {
  return get('/teams?sportId=1')
}

// ---------- Team page ----------

// One team with its record (wins, losses, division rank, streak)
export function getTeam(id) {
  return get(`/teams/${id}?hydrate=standings,division`)
}

// Players on a team with season stats; rosterType 'active' or '40Man'
export function getTeamRoster(id, season, rosterType = 'active') {
  const hydrate = `person(stats(type=season,season=${season},group=[hitting,pitching]))`
  return get(`/teams/${id}/roster?rosterType=${rosterType}&season=${season}&hydrate=${hydrate}`)
}

// All regular season and postseason games of a team
export function getTeamSchedule(id, season) {
  return get(`/schedule?sportId=1&teamId=${id}&season=${season}&gameType=R,F,D,L,W&hydrate=team`)
}

// Team totals for hitting, pitching and fielding
export function getTeamStats(id, season) {
  return get(`/teams/${id}/stats?stats=season&group=hitting,pitching,fielding&season=${season}`)
}

// Games on a date (YYYY-MM-DD)
export function getSchedule(date) {
  return get(`/schedule?sportId=1&date=${date}&hydrate=team,probablePitcher`)
}

// Stat leaders, e.g. 'homeRuns'
export function getLeaders(category, season) {
  return get(`/stats/leaders?leaderCategories=${category}&season=${season}`)
}


// ---------- Player page ----------

// One player + their team + this season's stats (season totals and every game)
export function getPlayerWithStats(id, season) {
  const hydrate = `currentTeam,stats(group=[hitting,pitching],type=[season,gameLog],season=${season})`
  return get(`/people/${id}?hydrate=${hydrate}`)
}

// Final scores + short team names for a list of games
export function getGames(gamePks) {
  return get(`/schedule?gamePks=${gamePks.join(',')}&hydrate=team`)
}

// Player photo URL, cropped to 4:5 from the top (show it in an aspect-[4/5] box)
export function playerPhotoUrl(id, width = 400) {
  const size = `c_fill,g_north,w_${width},h_${Math.round(width * 1.25)}`
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/${size},q_auto:best/v1/people/${id}/headshot/67/current`
}

export function teamLogoUrl(teamId) {
  return `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
}

export function getStandings(season) {
  return get(`/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=division,team`)
}

// Every postseason series (Wild Card -> World Series) with all its games
export function getPostseason(season) {
  return get(`/schedule/postseason/series?sportId=1&season=${season}&hydrate=team`)
}

export function getPlayerSeason(id, season) {
  const hydrate = `currentTeam,stats(group=[hitting,pitching],type=[season],season=${season})`
  return get(`/people/${id}?hydrate=${hydrate}`)
}

// ---------- Fantasy page ----------

// Only the fields the fantasy page uses, so the download stays small (all players at once)
const SEASON_STATS_FIELDS = [
  'stats', 'splits', 'stat', 'player', 'id', 'fullName', 'team', 'position', 'abbreviation',
  'gamesPlayed', 'plateAppearances', 'hits', 'doubles', 'triples', 'homeRuns', 'runs', 'rbi',
  'baseOnBalls', 'stolenBases', 'strikeOuts', 'avg', 'ops',
  'gamesStarted', 'outs', 'inningsPitched', 'wins', 'saves', 'holds', 'earnedRuns', 'era', 'whip',
].join(',')

// Season totals of every player who played, for one group ('hitting' or 'pitching')
export function getSeasonStats(group, season) {
  return get(`/stats?stats=season&group=${group}&season=${season}&sportId=1&playerPool=ALL&limit=3000&fields=${SEASON_STATS_FIELDS}`)
}

// ---------- Match page ----------

// One game with both teams, their records and the probable starting pitchers
export function getMatch(gamePk) {
  return get(`/schedule?gamePks=${gamePk}&hydrate=team,probablePitcher`)
}

// Every game two teams played against each other in a season (regular season + postseason)
export function getHeadToHead(teamId, opponentId, season) {
  return get(`/schedule?sportId=1&teamId=${teamId}&opponentId=${opponentId}&season=${season}&gameType=R,F,D,L,W&hydrate=team`)
}

// Who played in a game and how they did (batting and pitching lines per player)
export function getBoxscore(gamePk) {
  return get(`/game/${gamePk}/boxscore`)
}
