const { getLastDiscussionByUserID, getDiscussionsByUserID, getMessagesByDiscussionID, getDiscussionUsersByUserID, getDiscussionScrollPositionByUserIDAndByDiscussionID, setLastDiscussionByUserID, setDiscussionScrollPositionByUserIDAndByDiscussionID } = require('./database')

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

const getUserLastDiscussion = async userID => {
    return await getLastDiscussionByUserID(userID)
}

const getUserDiscussions = async userID => {
    return await getDiscussionsByUserID(userID)
}

const getUserDiscussionMessages = async discussionID => {
    return await getMessagesByDiscussionID(discussionID)
}

const getDiscussionUsersStatus = async (discussionID, sockets) => {
    let connectedUsers = []
    let disconnectedUsers = []
    let connectedUsersAll = []
    for (const socket of sockets) {
        connectedUsersAll.push(socket.userID)
    }

    const connectedUsersUnique = [...new Set(connectedUsersAll)]
    const discussionUsers = await getDiscussionUsersByUserID(discussionID)

    discussionUsers.sort((user1, user2) => user1.name - user2.name)

    for (const user of discussionUsers) {
        if (connectedUsersUnique.includes(user.userID))
            connectedUsers.push(user)
        else
            disconnectedUsers.push(user)
    }

    return {
        res: {
            connected: connectedUsers,
            disconnected: disconnectedUsers,
        }
    }
}

const getUserDiscussionScrollPosition = async (userID, lastDiscussion) => {
    return await getDiscussionScrollPositionByUserIDAndByDiscussionID(userID, lastDiscussion)
}

const setUserLastDiscussion = async (userID, lastDiscussion) => {
    await setLastDiscussionByUserID(userID, lastDiscussion)
}

const setUserDiscussionScrollPosition = async (userID, discussionID, scrollPosition) => {
    await setDiscussionScrollPositionByUserIDAndByDiscussionID(userID, discussionID, scrollPosition)
}

module.exports = { getUserInfo, getCurrentUserPlaylists, getCurrentUserTopArtists, getCurrentUserTopTracks, setCurrentUserPlaylist, fillCurrentUserPlaylist, getUserLastDiscussion, getUserDiscussions, getUserDiscussionMessages, getDiscussionUsersStatus, getUserDiscussionScrollPosition, setUserLastDiscussion, setUserDiscussionScrollPosition }