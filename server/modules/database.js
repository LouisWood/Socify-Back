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
        await knex.schema.createTable('Friends', function (table) {
            table.string('userID').notNullable()
            table.string('friendID').notNullable()
            table.string('discussionID').notNullable()
            table.primary(['userID', 'friendID'])
            table.foreign('userID').references('Users.userID')
            table.foreign('friendID').references('Users.userID')
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
            table.string('discussionID').notNullable()
            table.string('userID').notNullable()
            table.string('content').notNullable()
            table.string('date').notNullable()
            table.foreign('discussionID').references('Discussions.discussionID')
            table.foreign('userID').references('Users.userID')
        })
        await knex.schema.createTable('Participate', function (table) {
            table.string('userID').notNullable()
            table.integer('discussionID').notNullable()
            table.integer('scrollPosition').notNullable()
            table.foreign('userID').references('Users.userID')
            table.foreign('discussionID').references('Discussions.discussionID')
        })

        await knex('Discussions').insert({owner: '', name: 'Moi', picture: 'https://i.scdn.co/image/ab6775700000ee85d0390b295b07f8a52a101767'})
        await knex('Discussions').insert({owner: '4crvejyosedti4gfzemcx7zmn', name: 'Raf', picture: 'https://i.scdn.co/image/ab6775700000ee855067db235dd3330fd32360a4'})

        await knex('Messages').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussionID: 1, content: 'Bonjour', date: (new Date()).toString()})
        await knex('Messages').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussionID: 2, content: 'Bonjour', date: (new Date()).toString()})

        await knex('Messages').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussionID: 1, content: 'Bonjour', date: (new Date()).toString()})
        await knex('Messages').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussionID: 2, content: 'Bonjour', date: (new Date()).toString()})

        await knex('Participate').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussionID: 1, scrollPosition: -1})
        await knex('Participate').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussionID: 2, scrollPosition: -1})

        await knex('Participate').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussionID: 1, scrollPosition: -1})
        await knex('Participate').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussionID: 2, scrollPosition: -1})
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
    let message = {date: (new Date()).toString()}
    const user = await knex.select('name', 'picture').from('Users').where('userID', '=', userID)

    await knex.raw('INSERT INTO Messages (discussionID, userID, content, date) VALUES (?, ?, ?, ?)', [discussionID, userID, content, message.date])

    message.date = parseDate(message.date)
    message.name = user[0].name
    message.picture = user[0].picture

    return message
}

const getLastDiscussionByUserID = async userID => {
    let lastDiscussion = -1;
    const rows = await knex.select('lastDiscussion').from('Users').where('userID', '=', userID)

    if (rows.length === 1)
        lastDiscussion = rows[0].lastDiscussion
    
    return {
        res: lastDiscussion
    }
}

const getDiscussionsByUserID = async userID => {
    let friends = [];
    let discussions = [];
    const participants = await knex.select('discussionID').from('Participate').where('userID', '=', userID)

    if (participants.length !== 1) {
        for (const participant of participants) {
            const discussion = await knex.select('*').from('Discussions').where('discussionID', '=', participant.discussionID)
            if (discussion[0].owner !== '')
                discussions.push(discussion[0])
            else
                friends.unshift(discussion[0])
        }
    }

    return {
        res: friends.concat(discussions)
    }
}

const getMessagesByDiscussionID = async discussionID => {
    let messages = await knex.select('*').from('Messages').where('discussionID', '=', discussionID)
    
    if (messages.length > 0) {
        for (const message of messages) {
            const user = await knex.select('name', 'picture').from('Users').where('userID', '=', message.userID)
            message.date = parseDate(message.date)
            message.name = user[0].name
            message.picture = user[0].picture
        }
    }

    return {
        res: messages
    }
}

const getDiscussionUsersByUserID = async discussionID => {
    let response = [];
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
    let scrollPosition = -1;
    const participant = await knex.select('scrollPosition').from('Participate').where('userID', '=', userID).where('discussionID', '=', discussionID)

    if (participant.length > 0) {
        scrollPosition = participant[0].scrollPosition
    }

    return {
        res: scrollPosition
    }
}

const getUsersFromName = async name => {
    return await knex.raw('SELECT userID, name, picture FROM Users WHERE name LIKE ?', [`%${name}%`])
}

const getDiscussionsFromName = async name => {
    return await knex.raw(`SELECT discussionID, picture, name FROM Discussions WHERE owner != '' AND name LIKE ?`, [`%${name}%`])
}

const getDiscussionNumberOfParticipant = async discussionID => {
    const discussions = await knex.raw('SELECT userID FROM Participate WHERE discussionID = ?', [discussionID])
    return discussions.length
}

const setLastDiscussionByUserID = async (userID, lastDiscussion) => {
    await knex.raw('UPDATE Users SET lastDiscussion = ? WHERE userID = ?', [lastDiscussion, userID])
}

const setDiscussionScrollPositionByUserIDAndByDiscussionID = async (userID, discussionID, scrollPosition) => {
    await knex.raw('UPDATE Participate SET scrollPosition = ? WHERE userID = ? AND discussionID = ?', [scrollPosition, userID, discussionID])
}

const createDiscussion = async (userID, name, picture) => {
    await knex.raw('INSERT INTO Discussions (owner, name, picture) VALUES (?, ?, ?)', [userID, name, picture])

    //const discussion
}

module.exports = { createDatabaseIfNotExist, insertUserInDatabase, insertMessageInDiscussion, getLastDiscussionByUserID, getDiscussionsByUserID, getMessagesByDiscussionID, getDiscussionUsersByUserID, getDiscussionScrollPositionByUserIDAndByDiscussionID, getUsersFromName, getDiscussionsFromName, getDiscussionNumberOfParticipant, setLastDiscussionByUserID, setDiscussionScrollPositionByUserIDAndByDiscussionID, createDiscussion }