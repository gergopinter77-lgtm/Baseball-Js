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

// All MLB teams
export function getTeams() {
  return get('/teams?sportId=1')
}

// Games on a date (YYYY-MM-DD)
export function getSchedule(date) {
  return get(`/schedule?sportId=1&date=${date}`)
}

// Stat leaders, e.g. 'homeRuns'
export function getLeaders(category, season) {
  return get(`/stats/leaders?leaderCategories=${category}&season=${season}`)
}

// One player + their team + this season's stats (season totals and every game)
export function getPlayerWithStats(id, season) {
  const hydrate = `currentTeam,stats(group=[hitting,pitching],type=
  [season,gameLog],season=${season})`
  return get (`/people/${id}?hydrate=${hydrate}`)
}

// Final scores + short team names for a list of games
export function getGames(gamePks) {
  return get (`/schedule?gamePks=${gamePks.join(',')}&hydrate=team`)
}

// Picture links (these are images, not JSON, so we only build the URL)
  export function playerPhotoUrl(id) {
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${id}/headshot/67/current`
  }

  export function teamlogoUrl(teamId) {
    return `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
  }