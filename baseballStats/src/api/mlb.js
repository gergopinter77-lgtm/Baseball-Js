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