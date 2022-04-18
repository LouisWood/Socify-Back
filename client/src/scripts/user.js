import axios from 'axios'

axios.defaults.baseURL = 'https://localhost:8000'

export const getCurrentUserProfile = async () => {
  const response = await axios.get('/me')
  return 'data' in response ? response.data : null
}

export const getCurrentUserPlaylists = async () => {
  const response = await axios.get('/me/playlists')
  return 'data' in response ? response.data : null
}

export const getCurrentUserTopArtists = async () => {
  const response = await axios.get('/me/top/artists')
  return 'data' in response ? response.data : null
}

export const getCurrentUserTopTracks = async () => {
  const response = await axios.get('/me/top/tracks')
  return 'data' in response ? response.data : null
}

export const setCurrentUserPlaylist = async (playlistName, playlistDesc) => {
  const response = await axios.post('/users/me/playlists', {
    name: playlistName,
    description: playlistDesc
  })
  return 'data' in response ? response.data : null
}

export const fillCurrentUserPlaylist = async (playlistID, tracksUris) => {
  const response = await axios.post('/playlists/playlistID/tracks', {
    playlistID: playlistID,
    uris: tracksUris
  })
  return 'data' in response ? response.data : null
}