import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

export const getCurrentUserProfile = async () => {
    const response = await axios.post('/me')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserPlaylists = async () => {
    const response = await axios.post('/me/playlists')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserTopArtists = async () => {
    const response = await axios.post('/me/top/artists')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserTopTracks = async () => {
    const response = await axios.post('/me/top/tracks')
    return 'res' in response.data ? response.data.res : null
}

export const setCurrentUserPlaylist = async (playlistName, playlistDesc) => {
    const response = await axios.post('/users/me/playlists', {
        playlistName: playlistName,
        playlistDesc: playlistDesc
    })
    return 'res' in response.data ? response.data.res : null
}

export const fillCurrentUserPlaylist = async (playlistID, tracksUris) => {
    const response = await axios.post('/playlists/playlistID/tracks', {
        playlistID: playlistID,
        tracksUris: tracksUris
    })
    return 'res' in response.data ? response.data.res : null
}

export const logoutCurrentUser = async () => {
    await axios.post('/logout')
}