const fs = require('fs')
const { parseDate } = require('./common')

require('dotenv').config()

const knex = require('knex')({
    client: 'pg',
    connection: {
        host : process.env.DB_HOST,
        port : process.env.DB_PORT,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE,
        ssl: {
            rejectUnauthorized: false,
            requestCert: true
        }
    }
})

const createDatabaseIfNotExist = async () => {
    await knex.schema.hasTable('artist').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('artist', function (table) {
                table.string('artistid').primary().notNullable()
                table.string('name').notNullable()
                table.string('image').notNullable()
            })
        }
    })

    await knex.schema.hasTable('track').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('track', function (table) {
                table.string('trackid').primary().notNullable()
                table.string('name').notNullable()
                table.string('uri').notNullable()
                table.string('image').notNullable()
                table.string('artistname').notNullable()
                table.string('albumname').notNullable()
                table.string('duration').notNullable()
            })
        }
    })

    await knex.schema.hasTable('topartistlist').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('topartistlist', function (table) {
                table.primary(['listid', 'range'])
                table.string('listid').notNullable()
                table.string('range').notNullable()

                for(i = 0; i < 20; i++) {
                    table.string('artistid' + i)
                    table.foreign('artistid' + i).references('artist.artistid')
                }

                table.foreign('listid').references('Users.userID')
            })
        }
    })

    await knex.schema.hasTable('toptracklist').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('toptracklist', function (table) {
                table.primary(['listid', 'range'])
                table.string('listid').notNullable()
                table.string('range').notNullable()

                for(i = 0; i < 20; i++) {
                    table.string('trackid' + i)
                    table.foreign('trackid' + i).references('track.trackid')
                }

                table.foreign('listid').references('users.userid')
            })
        }
    })

    await knex.schema.hasTable('users').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('users', function (table) {
                table.string('userid').primary().notNullable()
                table.string('name').notNullable()
                table.string('picture').notNullable()
                table.integer('lastdiscussion').notNullable()
            })
        }
    })

    await knex.schema.hasTable('followers').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('followers', function (table) {
                table.string('userid').notNullable()
                table.string('followerid').notNullable()
                table.integer('discussionid').notNullable()
                table.primary(['userid', 'followerid'])
                table.foreign('userid').references('users.userID')
                table.foreign('followerid').references('users.userID')
                table.foreign('discussionid').references('discussions.discussionID')
            })
        }
    })
        
    await knex.schema.hasTable('discussions').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('discussions', function (table) {
                table.increments('discussionid').primary()
                table.string('owner').notNullable()
                table.string('name').notNullable()
                table.string('picture').notNullable()
                table.foreign('owner').references('Users.userID')
            })
        }
    })

    await knex.schema.hasTable('messages').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('messages', function (table) {
                table.increments('messageID').primary()
                table.integer('discussionid').notNullable()
                table.string('userid').notNullable()
                table.string('content').notNullable()
                table.string('date').notNullable()
                table.foreign('discussionid').references('discussions.discussionid')
                table.foreign('userid').references('users.userid')
            })
        }
    })
        

    await knex.schema.hasTable('participate').then(async (exists) => {
        if (!exists) {
            await knex.schema.createTable('participate', function (table) {
                table.string('userid').notNullable()
                table.integer('discussionid').notNullable()
                table.string('lastview').notNullable()
                table.integer('scrollposition').notNullable()
                table.primary(['userid', 'discussionid'])
                table.foreign('userid').references('users.userid')
                table.foreign('discussionid').references('discussions.discussionid')
            })
        }
    })
}

const insertUserInDatabase = async (res, userData, tokenData, topArtistT, topTrackT) => {
    const currentTime = new Date()
    const expireTime = new Date(currentTime.getTime() + 55 * 60 * 1000)
    const picture = userData.images.length > 0 ? userData.images[0].url : ''
    const rangeTerm = ['short_term', 'medium_term', 'long_term']

    res.cookie('userid', userData.id, {signed: true})
    res.cookie('access_token', tokenData.access_token, {signed: true})
    res.cookie('refresh_token', tokenData.refresh_token, {signed: true})
    res.cookie('expireTime', expireTime.toString(), {signed: true})

    const rows = await knex('users').select('*').where('userid', '=', userData.id)

    if (rows.length !== 1) {
        await knex('users').insert({userID: userData.id, name: userData.display_name, picture: picture, lastDiscussion: -1})
        
        for(i = 0; i < rangeTerm.length; i++) {
            await knex('topartistlist').insert({listID: userData.id, range: rangeTerm[i]}) 
            await knex('toptracklist').insert({listID: userData.id, range: rangeTerm[i]}) 
        }

        await fillTopArtistInDatabase(topArtistT, userData.id); 
        await fillTopTrackInDatabase(topTrackT, userData.id)
    }
}

const fillTopArtistInDatabase = async (topArtist, listID) => {
    const rangeTerm = ['short_term', 'medium_term', 'long_term']
    
    for(j = 0; j < topArtist.length; j++) {
        topArtistElement = topArtist[j].res.items

        if(topArtistElement.length > 1) {
            for(i = 0; i < topArtistElement.length; i++) {
                await knex.raw('UPDATE TopArtistList SET artistID' + i + ' = ? WHERE listID = ? AND range = ?', [topArtistElement[i].id, listID, rangeTerm[j]])
                const artistrow = await knex('artist').select('*').where('artistid', '=', topArtistElement[i].id)
                if(artistrow.length == 0)
                    await knex('artist').insert({artistID: topArtistElement[i].id, name: topArtistElement[i].name, image: topArtistElement[i].images[0].url})
            }
        }
    }
}

const fillTopTrackInDatabase = async (topTrack, listID) => {
    const rangeTerm = ['short_term', 'medium_term', 'long_term']

    for(l = 0; l < topTrack.length; l++) {
        topTrackElement = topTrack[l].res.items
        if(topTrackElement.length > 1) {
            for(k = 0; k < topTrackElement.length; k++) {
                await knex.raw('UPDATE TopTrackList SET trackID' + k + ' = ? WHERE ListID = ? AND range = ?', [topTrackElement[k].id, listID, rangeTerm[l]])
                const trackRow = await knex('track').select('*').where('trackid', '=', topTrackElement[k].id)
                if(trackRow.length == 0)
                    await knex('track').insert({trackID: topTrackElement[k].id, name: topTrackElement[k].name, 
                                               uri:topTrackElement[k].uri, image: topTrackElement[k].album.images[2].url, 
                                               artistName: topTrackElement[k].artists[0].name, albumName: topTrackElement[k].album.name, 
                                               duration: topTrackElement[k].duration_ms})
            }
        }
    }
}

const getLastDiscussionByUserID = async userID => {
    let lastDiscussion = -1
    const rows = await knex.select('lastdiscussion').from('users').where('userid', '=', userID)

    if (rows.length === 1)
        lastDiscussion = rows[0].lastDiscussion
    
    return {
        res: lastDiscussion
    }
}

const getUserFromDB = async(userID) => {
   return (await knex.raw('SELECT * FROM Users WHERE userID = \'' + userID + '\' '))[0]
}

const getTopArtistsFromDB = async (userID, time_range) => {
    if ((await knex.select('userid').from('users').where('userid', '=', userID)).length === 0)
        return null
    
    const topArtistList = Object.values((await knex.raw('SELECT * FROM TopArtistList WHERE range = \'' 
                                                        + time_range + '\' AND listID = \'' + userID +'\''))[0])
    artistDetails = []

    for(let i = 2; i < topArtistList.length; i++)
        artistDetails.push(await knex('artist').select('*').where('artistid', '=', topArtistList[i]).andWhere('artistid', '!=', 'null'))

    return artistDetails
}

const getTopTrackFromDB = async(userID, time_range) => {
    if ((await knex.select('userid').from('users').where('userid', '=', userID)).length === 0)
        return null
    
    const topTrackList = Object.values((await knex.raw('SELECT * FROM TopTrackList WHERE range = \'' 
                                                        + time_range + '\' AND listID = \'' + userID +'\''))[0])
    trackDetails = []

    for(let i = 2; i < topTrackList.length; i++)
        trackDetails.push(await knex('track').select('*').where('trackid', '=', topTrackList[i]).andWhere('trackid', '!=', 'null'))
    
    return trackDetails
}

const getOtherUsersFromDB = async(userID) => {
    const users = await knex('users').select('*').where('userid', '!=', userID)

    return users
}

const getFollowedUsers = async(userID) => {
    const followed = await getFollow(userID)
    const nbrFollowed = followed.length
    const userFollowed = []

    for( i = 0; i < followed.length; i++) {
        let user = await getUserFromDB(followed[i].userID)
        userFollowed.push(user)
    }

    return {nbrFollowed, userFollowed}
}

const getFollowersUsers = async(userID) => {
    const follower = await knex.select('followerid').from('followers').where('userid', '=', userID)
    const nbrFollower = follower.length
    const userFollower = []

    for( i = 0; i < follower.length; i++) {
        let user = await getUserFromDB(follower[i].followerID)
        userFollower.push(user)
    }

    return {nbrFollower, userFollower}
}

const insertMessageInDiscussion = async (discussionID, userID, content) => {
    const date = new Date()
    let message = {date: date.toString()}
    const user = await knex.select('name', 'picture').from('users').where('userid', '=', userID)

    await knex('messages').insert({discussionID: discussionID, userID: userID, content: content, date: message.date})
    
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const hoursString = hours < 10 ? `0${hours}` : hours.toString()
    const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString()

    message.rawDate = message.date
    message.dateMin = `${hoursString}:${minutesString}`
    message.date = parseDate(message.date)
    message.name = user[0].name
    message.picture = user[0].picture

    return message
}

const getDiscussionsByUserID = async userID => {
    let follow = []
    let discussions = []
    const participants = await knex.select('discussionid').from('participate').where('userid', '=', userID)

    if (participants.length > 0) {
        for (const participant of participants) {
            const discussion = await knex.select('*').from('discussions').where('discussionid', '=', participant.discussionID)
            if (discussion[0].owner !== '')
                discussions.push(discussion[0])
            else {
                const userInfo = await knex.select('name', 'picture').from('users').where('userid', '!=', userID)
                discussion[0].name = userInfo[0].name
                discussion[0].picture = userInfo[0].picture
                follow.unshift(discussion[0])
            }
        }
    }

    return {
        res: follow.concat(discussions)
    }
}

const getMessagesByDiscussionID = async discussionID => {
    let messages = await knex.select('*').from('messages').where('discussionid', '=', discussionID)
    
    if (messages.length > 0) {
        for (const message of messages) {
            const user = await knex.select('name', 'picture').from('users').where('userid', '=', message.userID)

            const date = new Date(message.date)
            
            const hours = date.getHours()
            const minutes = date.getMinutes()

            const hoursString = hours < 10 ? `0${hours}` : hours.toString()
            const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString()

            message.rawDate = message.date
            message.dateMin = `${hoursString}:${minutesString}`
            message.date = parseDate(message.date)
            message.name = user[0].name
            message.picture = user[0].picture
        }
    }

    return {
        res: messages
    }
}

const getDiscussionUsersByDiscussionID = async discussionID => {
    let response = []
    const participants = await knex.select('userid').from('participate').where('discussionid', '=', discussionID)

    if (participants.length > 0) {
        for (const participant of participants) {
            const user = await knex.select('userid', 'name', 'picture').from('users').where('userid', '=', participant.userID)
            response.push(user[0])
        }
    }

    return response
}

const getDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID) => {
    let scrollPosition = -1
    const participant = await knex.select('scrollposition').from('participate').where('userid', '=', userID).where('discussionid', '=', discussionID)

    if (participant.length > 0) {
        scrollPosition = participant[0].scrollPosition
    }

    return {
        res: scrollPosition
    }
}

const getUsersFromName = async (userID, name) => {
    return await knex.select('userid', 'name', 'picture').from('users').where('name', 'like', `%${name}%`).where('userid', '!=', userID)
}

const getDiscussionsFromName = async name => {
    return await knex.select('discussionid', 'name', 'picture').from('discussions').where('owner', '!=', '').where('name', 'like', `%${name}%`)
}

const getDiscussionNumberOfParticipant = async discussionID => {
    const discussions = await knex.select('userid').from('participate').where('discussionid', '=', discussionID)
    return discussions.length
}

const getAllDiscussions = async () => {
    return await knex.select('discussionid', 'name', 'picture').from('discussions').where('owner', '!=', '')
}

const setLastDiscussionByUserID = async (userID, lastDiscussion) => {
    await knex('users').update('lastdiscussion', lastDiscussion).where('userid', '=', userID)
}

const setDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID, scrollPosition) => {
    await knex('participate').update('scrollposition', scrollPosition).where('userid', '=', userID).where('discussionid', '=', discussionID)
}

const createDiscussion = async (userID, name, picture) => {    
    const discussion = await knex('discussions').insert({owner: userID, name: name, picture: picture}).then(data => {
        return data
    })

    await knex('participate').insert({userID: userID, discussionID: discussion[0], lastView: (new Date()).toString(), scrollPosition: -1})

    return discussion[0]
}

const createDiscussionUser = async (userID) => {
    const discussion = await knex('discussions').insert({owner: '', name: '', picture: ''}).then(data => {
        return data
    })

    await knex('participate').insert({userID: userID, discussionID: discussion[0], lastView: (new Date()).toString(), scrollPosition: -1})

    return discussion[0]
}

const insertFollower = async (userID, follow, discussionID) => {
    await knex('followers').insert({userID: follow, followerID: userID, discussionID: discussionID})
}

const joinDiscussion = async (userID, discussionID, date) => {
    await knex('participate').insert({userID: userID, discussionID: discussionID, lastView: date.toString(), scrollPosition: -1})
}

const getFollow = async (userID) => {
    return await knex.select('userid').from('followers').where('followerid', '=', userID)
}

const getDiscussionOwner = async (discussionID) => {
    const discussion = await knex.select('owner').from('discussions').where('discussionid', '=', discussionID)
    return discussion[0].owner
}

const getFollowID = async (discussionID) => {
    const follow = await knex.select('userid').from('followers').where('discussionid', '=', discussionID)
    return follow[0].userID
}

const getMessagesWaiting = async (userID) => {
    let discussionsMap = new Map()
    const discussions = await knex.select('discussionid', 'lastview').from('participate').where('userid', '=', userID)

    if (discussions.length > 0) {
        for (const discussion of discussions) {
            let count = 0
            const messages = await knex.select('date').from('messages').where('discussionid', '=', discussion.discussionID).where('userid', '!=', userID)

            for (const message of messages) {
                if (Date.parse(message.date) > Date.parse(discussion.lastView))
                    count++
            }
            
            discussionsMap.set(discussion.discussionID, count)
        }
    }

    return discussionsMap
}

const setDiscussionLastView = async (userID, discussionID, lastView) => {
    await knex('participate').update('lastview', lastView).where('userid', '=', userID).where('discussionid', '=', discussionID)
}

const checkIfUserInDiscussion = async (userID, discussionID) => {
    return await knex.select('userid').from('participate').where('userid', '=', userID).where(discussionID, '=', discussionID)
}

const getDiscussion = async userID => {
    return await knex.select('discussionid').from('participate').where('userid', '=', userID)
}

const getFollowerDiscussionID = async (userID, followerID) => {
    return await knex.select('discussionid').from('followers').where('userid', '=', userID).where('followerid', '=', followerID)
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