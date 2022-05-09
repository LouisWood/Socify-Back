const fs = require('fs')
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
            table.primary(['userID', 'friendID'])
            table.foreign('userID').references('Users.userID')
            table.foreign('friendID').references('Users.userID')
        })
        await knex.schema.createTable('Discussions', function (table) {
            table.increments('discussionID').primary()
            table.string('picture').notNullable()
            table.string('name').notNullable()
            table.boolean('type').notNullable()
        })
        await knex.schema.createTable('Messages', function (table) {
            table.increments('messageID').primary()
            table.string('userID').notNullable()
            table.string('discussion').notNullable()
            table.string('content').notNullable()
            table.string('date').notNullable()
            table.foreign('userID').references('Users.userID')
            table.foreign('discussion').references('Discussions.name')
        })
        await knex.schema.createTable('Participate', function (table) {
            table.string('userID').notNullable()
            table.integer('discussionID').notNullable()
            table.foreign('userID').references('Users.userID')
            table.foreign('discussionID').references('Discussions.discussionID')
        })

        await knex('Discussions').insert({picture: 'https://i.scdn.co/image/ab6775700000ee85d0390b295b07f8a52a101767', name: 'Moi', type: false})
        await knex('Discussions').insert({picture: 'https://i.scdn.co/image/ab6775700000ee855067db235dd3330fd32360a4', name: 'Raf', type: true})

        await knex('Messages').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussion: 'Moi', content: 'Bonjour', date: new Date()})
        await knex('Messages').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussion: 'Raf', content: 'Bonjour', date: new Date()})

        await knex('Messages').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussion: 'Moi', content: 'Bonjour', date: new Date()})
        await knex('Messages').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussion: 'Raf', content: 'Bonjour', date: new Date()})

        await knex('Participate').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussionID: 1})
        await knex('Participate').insert({userID: '4crvejyosedti4gfzemcx7zmn', discussionID: 2})

        await knex('Participate').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussionID: 1})
        await knex('Participate').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', discussionID: 2})
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

const insertMessageInDiscussion = async (userID, discussion, content) => {
    await knex.raw('INSERT INTO Messages (userID, discussion, content) VALUES (?, ?, ?)', userID, discussion, content)
}

const getLastDiscussionByUserID = async userID => {
    let lastDiscussion = -1;
    const rows = await knex.select('*').from('Users').where('userID', '=', userID)

    if (rows.length !== 1)
        lastDiscussion = rows[0].lastDiscussion
    
    return {
        res: {
            lastDiscussion: lastDiscussion
        }
    }
}

const getDiscussionsByUserID = async userID => {
    let friends = [];
    let discussions = [];
    const rows = await knex.select('*').from('Participate').where('userID', '=', userID)

    if (rows.length !== 1) {
        for (const row of rows) {
            const discussion = await knex.select('*').from('Discussions').where('discussionID', '=', row.discussionID)
            if (discussion[0].type)
                discussions.push(discussion[0])
            else
                friends.push(discussion[0])
        }
    }

    return {
        res: {
            friends: friends,
            discussions: discussions
        }
    }
}

const getMessagesByUserIDAndDiscussionID = async (userID, discussionID) => {
    let messages = [];
    const rows = await knex.select('*').from('Discussions').where('discussionID', '=', discussionID)

    if (rows.length !== 1) {
        for (const row of rows) {
            const message = await knex.select('*').from('Messages').where('userID', '=', userID).where('discussion', '=', row.name)
            messages.push(message)
        }
    }

    return {
        res: messages
    }
}

const setLastDiscussionByUserID = async (userID, lastDiscussion) => {
    await knex.raw('UPDATE Users SET lastDiscussion = ? WHERE userID = ?', lastDiscussion, userID)
}

module.exports = { createDatabaseIfNotExist, insertUserInDatabase, insertMessageInDiscussion, getLastDiscussionByUserID, getDiscussionsByUserID, getMessagesByUserIDAndDiscussionID, setLastDiscussionByUserID }