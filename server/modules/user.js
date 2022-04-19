const axios = require('axios').default

axios.defaults.baseURL = 'https://api.spotify.com/v1'
axios.defaults.headers['Content-Type'] = 'application/json'

const getUserInfo = async (access_token) => {
    const response = await axios.get('/me', {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    .then(resUser => {
        return {
            res: resUser.data
        }
    })
    .catch(err => {
        return {
            error: err
        }
    })

    return response
}

const getCurrentUserPlaylists = async (access_token) => {
    const limit = 20

    const response = await axios.get(`/me/playlists?limit=${limit}`, {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    .then(resUser => {
        return {
            res: resUser.data
        }
    })
    .catch(err => {
        return {
            error: err
        }
    })

    return response
}

const getCurrentUserTopArtists = async (access_token) => {
    const time_range = 'short_term'

    const response = await axios.get(
        `/me/top/artists?time_range=${time_range}`, {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    .then(resUser => {
        return {
            res: resUser.data
        }
    })
    .catch(err => {
        return {
            error: err
        }
    })

    return response
}

const getCurrentUserTopTracks = async (access_token) => {
    const time_range = 'short_term'

    const response = await axios.get(
        `/me/top/tracks?time_range=${time_range}`, {
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    .then(resUser => {
        return {
            res: resUser.data
        }
    })
    .catch(err => {
        return {
            error: err
        }
    })

    return response
}

const setCurrentUserPlaylist = async (userID, access_token, playlistName, playlistDesc) => {
    const response = await axios({
        method: "POST",
        url: `/users/${userID}/playlists`,
        headers: {
            Authorization: 'Bearer ' + access_token
        },
        data: JSON.stringify({
            name: playlistName,
            description: playlistDesc
        })
    })
    .then(resUser => {
        return {
            res: resUser.data
        }
    })
    .catch(err => {
        return {
            error: err
        }
    })

    console.log(response)
    return response
}

const fillCurrentUserPlaylist = async (access_token, playlistID, tracksUris) => {
    const response = await axios({
        method: "POST",
        url: `/playlists/${playlistID}/tracks`,
        headers: {
            Authorization: 'Bearer ' + access_token
        },
        data: JSON.stringify({
            uris: tracksUris
        })
    })
    .then(resUser => {
        return {
            res: resUser.data
        }
    })
    .catch(err => {
        return {
            error: err
        }
    })

    return response
}

module.exports = { getUserInfo, getCurrentUserPlaylists, getCurrentUserTopArtists, getCurrentUserTopTracks, setCurrentUserPlaylist, fillCurrentUserPlaylist }