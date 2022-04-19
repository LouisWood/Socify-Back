import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'

/**
 * Calculer la moyenne des éléments d'un tableau
 * https://poopcode.com/calculate-the-average-of-an-array-of-numbers-in-javascript/
 * @param {} arr 
 * @returns 
 */
const average = arr => 
    arr.reduce((a,b) => a + b, 0) / arr.length

export const getTracksAverageStats = async (tracks) => {
    let tabAcousticness = []
    let tabDanceability = []
    let tabEnergy = []
    let tabInstrumentalness = []
    let tabValence = []
    let averageStats = new Map() 

    for (const track of tracks) {
        const infoTrack = await getTracksInfo(track.id)

        tabAcousticness.push(infoTrack.data.acousticness)
        tabDanceability.push(infoTrack.data.danceability)
        tabEnergy.push(infoTrack.data.energy)
        tabInstrumentalness.push(infoTrack.data.instrumentalness)
        tabValence.push(infoTrack.data.valence)
    }

    averageStats.set('Acoustique', average(tabAcousticness).toFixed(2) * 100 + '%')
    averageStats.set('Dansabilité', average(tabDanceability).toFixed(2) * 100 + '%')
    averageStats.set('Énergie', average(tabEnergy).toFixed(2) * 100 + '%')
    averageStats.set('Instrumentalité', average(tabInstrumentalness).toFixed(2) * 100 + '%')
    averageStats.set('Valence', average(tabValence).toFixed(2) * 100 + '%')
    
    return averageStats
}

export const getArtistTopTrack = async (artistID) => {
    const response = await axios.post('/artists/artistID/top-tracks', {
        artistID: artistID
    })
    return 'data' in response ? response.data : null
}

export const getTracksInfo = async (trackID) => {
    const response = await axios.post('/audio-features/trackID', {
        trackID: trackID
    })
    return 'data' in response ? response.data : null
}

export const getPlaylistByID = async (playlistID) => {
    const response = await axios.post('/playlists/playlistID', {
        playlistID: playlistID
    })
    return 'data' in response ? response.data : null
}