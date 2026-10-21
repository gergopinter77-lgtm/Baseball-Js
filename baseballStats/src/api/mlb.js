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

// Players on a team, each with their season stats.
// rosterType: 'active' (26 players) or '40Man'
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
  return get(`/schedule?sportId=1&date=${date}`)
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

// Picture links (these are images, not JSON, so we only build the URL)
// Cropped to 4:5 from the top, so the whole head down to the neck is in the picture.
// Show it in a box with the same 4:5 shape (aspect-[4/5]) so nothing more gets cut off.
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