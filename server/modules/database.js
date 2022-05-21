const fs = require('fs')
const { parseDate } = require('./common')

require('dotenv').config()

const dbExist = fs.existsSync(process.env.DB_PATH)
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: process.env.DB_PATH
    },
    useNullAsDefault: true
})

const createDatabaseIfNotExist = async () => {
    if (!dbExist) {
        await knex.schema.createTable('Users', function (table) {
            table.string('userID').primary().notNullable()
            table.string('name').notNullable()
            table.string('picture').notNullable()
            table.integer('lastDiscussion').notNullable()
        })
        await knex.schema.createTable('Followers', function (table) {
            table.string('userID').notNullable()
            table.string('followerID').notNullable()
            table.integer('discussionID').notNullable()
            table.primary(['userID', 'followerID'])
            table.foreign('userID').references('Users.userID')
            table.foreign('followerID').references('Users.userID')
            table.foreign('discussionID').references('Discussions.discussionID')
        })
        await knex.schema.createTable('Discussions', function (table) {
            table.increments('discussionID').primary()
            table.string('owner').notNullable()
            table.string('name').notNullable()
            table.string('picture').notNullable()
            table.foreign('owner').references('Users.userID')
        })
        await knex.schema.createTable('Messages', function (table) {
            table.increments('messageID').primary()
            table.integer('discussionID').notNullable()
            table.string('userID').notNullable()
            table.string('content').notNullable()
            table.string('date').notNullable()
            table.foreign('discussionID').references('Discussions.discussionID')
            table.foreign('userID').references('Users.userID')
        })
        await knex.schema.createTable('Participate', function (table) {
            table.string('userID').notNullable()
            table.integer('discussionID').notNullable()
            table.string('lastView').notNullable()
            table.integer('scrollPosition').notNullable()
            table.primary(['userID', 'discussionID'])
            table.foreign('userID').references('Users.userID')
            table.foreign('discussionID').references('Discussions.discussionID')
        })
    }
}

const insertUserInDatabase = async (res, userData, tokenData) => {
    const currentTime = new Date()
    const expireTime = new Date(currentTime.getTime() + 55 * 60 * 1000)
    const picture = userData.images.length > 0 ? userData.images[0].url : ''

    res.cookie('userID', userData.id, {signed: true})
    res.cookie('access_token', tokenData.access_token, {signed: true})
    res.cookie('refresh_token', tokenData.refresh_token, {signed: true})
    res.cookie('expireTime', expireTime.toString(), {signed: true})

    const rows = await knex('Users').select('*').where('userID', '=', userData.id)

    if (rows.length !== 1) {
        await knex('Users').insert({userID: userData.id, name: userData.display_name, picture: picture, lastDiscussion: -1})
    }
}

const insertMessageInDiscussion = async (discussionID, userID, content) => {
    const date = new Date()
    let message = {date: date.toString()}
    const user = await knex.select('name', 'picture').from('Users').where('userID', '=', userID)

    await knex('Messages').insert({discussionID: discussionID, userID: userID, content: content, date: message.date})
    
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

const getLastDiscussionByUserID = async userID => {
    let lastDiscussion = -1
    const rows = await knex.select('lastDiscussion').from('Users').where('userID', '=', userID)

    if (rows.length === 1)
        lastDiscussion = rows[0].lastDiscussion
    
    return {
        res: lastDiscussion
    }
}

const getDiscussionsByUserID = async userID => {
    let follow = []
    let discussions = []
    const participants = await knex.select('discussionID').from('Participate').where('userID', '=', userID)

    if (participants.length > 0) {
        for (const participant of participants) {
            const discussion = await knex.select('*').from('Discussions').where('discussionID', '=', participant.discussionID)
            if (discussion[0].owner !== '')
                discussions.push(discussion[0])
            else {
                const userInfo = await knex.select('name', 'picture').from('Users').where('userID', '!=', userID)
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
    let messages = await knex.select('*').from('Messages').where('discussionID', '=', discussionID)
    
    if (messages.length > 0) {
        for (const message of messages) {
            const user = await knex.select('name', 'picture').from('Users').where('userID', '=', message.userID)

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
    const participants = await knex.select('userID').from('Participate').where('discussionID', '=', discussionID)

    if (participants.length > 0) {
        for (const participant of participants) {
            const user = await knex.select('userID', 'name', 'picture').from('Users').where('userID', '=', participant.userID)
            response.push(user[0])
        }
    }

    return response
}

const getDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID) => {
    let scrollPosition = -1
    const participant = await knex.select('scrollPosition').from('Participate').where('userID', '=', userID).where('discussionID', '=', discussionID)

    if (participant.length > 0) {
        scrollPosition = participant[0].scrollPosition
    }

    return {
        res: scrollPosition
    }
}

const getUsersFromName = async (userID, name) => {
    return await knex.select('userID', 'name', 'picture').from('Users').where('name', 'like', `%${name}%`).where('userID', '!=', userID)
}

const getDiscussionsFromName = async name => {
    return await knex.select('discussionID', 'name', 'picture').from('Discussions').where('owner', '!=', '').where('name', 'like', `%${name}%`)
}

const getDiscussionNumberOfParticipant = async discussionID => {
    const discussions = await knex.select('userID').from('Participate').where('discussionID', '=', discussionID)
    return discussions.length
}

const getAllDiscussions = async () => {
    return await knex.select('discussionID', 'name', 'picture').from('Discussions').where('owner', '!=', '')
}

const setLastDiscussionByUserID = async (userID, lastDiscussion) => {
    await knex('Users').update('lastDiscussion', lastDiscussion).where('userID', '=', userID)
}

const setDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID, scrollPosition) => {
    await knex('Participate').update('scrollPosition', scrollPosition).where('userID', '=', userID).where('discussionID', '=', discussionID)
}

const createDiscussion = async (userID, name, picture) => {    
    const discussion = await knex('Discussions').insert({owner: userID, name: name, picture: picture}).then(data => {
        return data
    })

    await knex('Participate').insert({userID: userID, discussionID: discussion[0], lastView: (new Date()).toString(), scrollPosition: -1})

    return discussion[0]
}

const createDiscussionUser = async (userID) => {
    const discussion = await knex('Discussions').insert({owner: '', name: '', picture: ''}).then(data => {
        return data
    })

    await knex('Participate').insert({userID: userID, discussionID: discussion[0], lastView: (new Date()).toString(), scrollPosition: -1})

    return discussion[0]
}

const insertFollower = async (userID, follow, discussionID) => {
    await knex('Followers').insert({userID: follow, followerID: userID, discussionID: discussionID})
}

const joinDiscussion = async (userID, discussionID, date) => {
    await knex('Participate').insert({userID: userID, discussionID: discussionID, lastView: date.toString(), scrollPosition: -1})
}

const getFollow = async (userID) => {
    return await knex.select('userID').from('Followers').where('followerID', '=', userID)
}

const getdiscussionOwner = async (discussionID) => {
    const discussion = await knex.select('owner').from('Discussions').where('discussionID', '=', discussionID)
    return discussion[0].owner
}

const getFollowID = async (discussionID) => {
    const follow = await knex.select('userID').from('Followers').where('discussionID', '=', discussionID)
    return follow[0].userID
}

const getMessagesWaiting = async (userID) => {
    let discussionsMap = new Map()
    const discussions = await knex.select('discussionID', 'lastView').from('Participate').where('userID', '=', userID)

    if (discussions.length > 0) {
        for (const discussion of discussions) {
            let count = 0
            const messages = await knex.select('date').from('Messages').where('discussionID', '=', discussion.discussionID).where('userID', '!=', userID)

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
    await knex('Participate').update('lastView', lastView).where('userID', '=', userID).where('discussionID', '=', discussionID)
}

const checkIfUserInDiscussion = async (userID, discussionID) => {
    return await knex.select('userID').from('Participate').where('userID', '=', userID).where(discussionID, '=', discussionID)
}

module.exports = { createDatabaseIfNotExist, insertUserInDatabase, insertMessageInDiscussion, getLastDiscussionByUserID, getDiscussionsByUserID, getMessagesByDiscussionID, getDiscussionUsersByDiscussionID, getDiscussionScrollPositionByUserIDAndByDiscussionID, getUsersFromName, getDiscussionsFromName, getDiscussionNumberOfParticipant, getAllDiscussions, setLastDiscussionByUserID, setDiscussionScrollPositionByUserIDAndByDiscussionID, createDiscussion, createDiscussionUser, insertFollower, joinDiscussion, getFollow, getdiscussionOwner, getFollowID, getMessagesWaiting, setDiscussionLastView, checkIfUserInDiscussion }