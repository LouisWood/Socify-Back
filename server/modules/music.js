const axios = require('axios').default

axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Content-Type'] = 'application/json';

const getArtistTopTrack = async (access_token, artistID) => {
    const response = await axios.get(
        `/artists/${artistID}/top-tracks?country=US`, {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    .then(resMusic => {
        return {
            data: resMusic.data
        }
    })
    .catch(() => {
        return {
            error: 'error'
        }
    })
    
    return response
}

const getTracksInfo = async (access_token, trackID) => {
    const response = await axios.get(
        `/audio-features/${trackID}`, {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    .then(resMusic => {
        return {
            data: resMusic.data
        }
    })
    .catch(() => {
        return {
            error: 'error'
        }
    })
    
    return response
}

const getPlaylistByID = async (access_token, playlistID) => {
    const response = await axios.get(
        `/playlists/${playlistID}`, {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    .then(resMusic => {
        return {
            data: resMusic.data
        }
    })
    .catch(() => {
        return {
            error: 'error'
        }
    })
    
    return response
}

module.exports = { getArtistTopTrack, getTracksInfo, getPlaylistByID }