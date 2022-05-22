const axios = require('axios')

axios.defaults.baseURL = 'https://socify-database.glitch.me/'

const insertUserInDatabase = async (res, userData, tokenData, topArtistT, topTrackT) => {
    await axios.post('/insertUserInDatabase', {
        res: res,
        userData: userData,
        tokenData: tokenData,
        topArtistT: topArtistT,
        topTrackT: topTrackT
    })
}

const fillTopArtistInDatabase = async (topArtist, listID) => {
    await axios.post('/fillTopArtistInDatabase', {
        topArtist: topArtist,
        listID: listID
    })
}

const fillTopTrackInDatabase = async (topTrack, listID) => {
    await axios.post('/fillTopTrackInDatabase', {
        topTrack: topTrack,
        listID: listID
    })
}

const getLastDiscussionByUserID = async userID => {
    const response = await axios.post('/getLastDiscussionByUserID', {
        userID: userID
    })
    return response
}

const getUserFromDB = async(userID) => {
    const response = await axios.post('/getUserFromDB', {
        userID: userID
    })
    return response.res
}

const getTopArtistsFromDB = async (userID, time_range) => {
    const response = await axios.post('/getTopArtistsFromDB', {
        userID: userID,
        time_range: time_range
    })
    return response.res
}

const getTopTrackFromDB = async(userID, time_range) => {
    const response = await axios.post('/getTopTrackFromDB', {
        userID: userID,
        time_range: time_range
    })
    return response.res
}

const getOtherUsersFromDB = async(userID) => {
    const response = await axios.post('/getOtherUsersFromDB', {
        userID: userID
    })
    return response.res
}

const getFollowedUsers = async(userID) => {
    const response = await axios.post('/getFollowedUsers', {
        userID: userID
    })
    return response.res
}

const getFollowersUsers = async(userID) => {
    const response = await axios.post('/getFollowersUsers', {
        userID: userID
    })
    return response.res
}

const insertMessageInDiscussion = async (discussionID, userID, content) => {
    const response = await axios.post('/insertMessageInDiscussion', {
        discussionID: discussionID,
        userID: userID,
        content: content
    })
    return response.res
}

const getDiscussionsByUserID = async userID => {
    const response = await axios.post('/getDiscussionsByUserID', {
        userID: userID
    })
    return response
}

const getMessagesByDiscussionID = async discussionID => {
    const response = await axios.post('/getMessagesByDiscussionID', {
        discussionID: discussionID
    })
    return response
}

const getDiscussionUsersByDiscussionID = async discussionID => {
    const response = await axios.post('/getDiscussionUsersByDiscussionID', {
        discussionID: discussionID
    })
    return response.res
}

const getDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID) => {
    const response = await axios.post('/getDiscussionScrollPositionByUserIDAndByDiscussionID', {
        userID: userID,
        discussionID: discussionID
    })
    return response
}

const getUsersFromName = async (userID, name) => {
    const response = await axios.post('/getUsersFromName', {
        userID: userID,
        name: name
    })
    return response.res
}

const getDiscussionsFromName = async name => {
    const response = await axios.post('/getDiscussionsFromName', {
        name: name
    })
    return response.res
}

const getDiscussionNumberOfParticipant = async discussionID => {
    const response = await axios.post('/getDiscussionNumberOfParticipant', {
        discussionID: discussionID
    })
    return response.res
}

const getAllDiscussions = async () => {
    const response = await axios.get('/getAllDiscussions')
    return response.res
}

const setLastDiscussionByUserID = async (userID, lastDiscussion) => {
    const response = await axios.post('/setLastDiscussionByUserID', {
        userID: userID,
        lastDiscussion: lastDiscussion
    })
    return response.res
}

const setDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID, scrollPosition) => {
    const response = await axios.post('/setDiscussionScrollPositionByUserIDAndByDiscussionID', {
        userID: userID,
        discussionID: discussionID,
        scrollPosition: scrollPosition
    })
    return response.res
}

const createDiscussion = async (userID, name, picture) => {
    const response = await axios.post('/createDiscussion', {
        userID: userID,
        name: name,
        picture: picture
    })
    return response.res
}

const createDiscussionUser = async (userID) => {
    const response = await axios.post('/createDiscussionUser', {
        userID: userID
    })
    return response.res
}

const insertFollower = async (userID, follow, discussionID) => {
    await axios.post('/insertFollower', {
        userID: userID,
        follow: follow,
        discussionID: discussionID
    })
}

const joinDiscussion = async (userID, discussionID, date) => {
    await axios.post('/joinDiscussion', {
        userID: userID,
        discussionID: discussionID,
        date: date
    })
}

const getFollow = async (userID) => {
    const response = await axios.post('/getFollow', {
        userID: userID
    })
    return response.res
}

const getDiscussionOwner = async (discussionID) => {
    const response = await axios.post('/getDiscussionOwner', {
        discussionID: discussionID
    })
    return response.res
}

const getFollowID = async (discussionID) => {
    const response = await axios.post('/getFollowID', {
        discussionID: discussionID
    })
    return response.res
}

const getMessagesWaiting = async (userID) => {
    const response = await axios.post('/getMessagesWaiting', {
        userID: userID
    })
    return response.res
}

const setDiscussionLastView = async (userID, discussionID, lastView) => {
    await axios.post('/setDiscussionLastView', {
        userID: userID,
        discussionID: discussionID,
        lastView: lastView
    })
}

const checkIfUserInDiscussion = async (userID, discussionID) => {
    const response = await axios.post('/checkIfUserInDiscussion', {
        userID: userID,
        discussionID: discussionID
    })
    return response.res
}

const getDiscussion = async userID => {
    const response = await axios.post('/getDiscussion', {
        userID: userID
    })
    return response.res
}

const getFollowerDiscussionID = async (userID, followerID) => {
    const response = await axios.post('/getFollowerDiscussionID', {
        userID: userID,
        followerID: followerID
    })
    return response.res
}

module.exports = { createDatabaseIfNotExist, insertUserInDatabase, insertMessageInDiscussion,
    getLastDiscussionByUserID, getDiscussionsByUserID, getMessagesByDiscussionID,
    getDiscussionUsersByDiscussionID, getDiscussionScrollPositionByUserIDAndByDiscussionID, getUsersFromName,
    getDiscussionsFromName, getDiscussionNumberOfParticipant, getAllDiscussions,
    setLastDiscussionByUserID, setDiscussionScrollPositionByUserIDAndByDiscussionID, createDiscussion,
    createDiscussionUser, insertFollower, joinDiscussion,
    getFollow, getDiscussionOwner, getFollowID,
    getMessagesWaiting, setDiscussionLastView, checkIfUserInDiscussion,
    getTopArtistsFromDB, getTopTrackFromDB, getUserFromDB,
    fillTopArtistInDatabase, fillTopTrackInDatabase, getOtherUsersFromDB,
    getFollowedUsers, getFollowersUsers, getDiscussion,
    getFollowerDiscussionID }