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
            table.string('category').notNullable()
        })
        await knex.schema.createTable('Messages', function (table) {
            table.increments('messageID').primary()
            table.string('userID').notNullable()
            table.string('category').notNullable()
            table.string('content').notNullable()
            table.foreign('userID').references('Users.userID')
            table.foreign('category').references('Discussions.category')
        })
        await knex.schema.createTable('Participate', function (table) {
            table.string('userID').notNullable()
            table.integer('discussionID').notNullable()
            table.foreign('userID').references('Users.userID')
            table.foreign('discussionID').references('Discussions.discussionID')
        })

        await knex('Discussions').insert({picture: 'https://i.scdn.co/image/ab6775700000ee85d0390b295b07f8a52a101767', category: 'Moi'})
        await knex('Discussions').insert({picture: 'https://i.scdn.co/image/ab6775700000ee855067db235dd3330fd32360a4', category: 'Raf'})

        await knex('Messages').insert({userID: '4crvejyosedti4gfzemcx7zmn', category: 'Musique 1', content: 'Bonjour'})
        await knex('Messages').insert({userID: '4crvejyosedti4gfzemcx7zmn', category: 'Musique 2', content: 'Bonjour'})

        await knex('Messages').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', category: 'Musique 1', content: 'Bonjour'})
        await knex('Messages').insert({userID: '31a5ikz4azfj4c56ozwlk7wzq4ti', category: 'Musique 2', content: 'Bonjour'})

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

    console.log(userData.id)

    const rows = await knex('Users').select('*').where('userID', '=', userData.id)

    if (rows.length !== 1) {
        await knex('Users').insert({userID: userData.id, name: userData.display_name, picture: picture})
    }
}

const insertMessageInDiscussion = async (userID, category, content) => {
    await knex.raw('INSERT INTO Messages (userID, category, content) VALUES (?, ?, ?)', userID, category, content)
}

const getDiscussionsByUserID = async (userID) => {
    let response = [];
    const rows = await knex.select('*').from('Participate').where('userID', '=', userID)

    if (rows.length !== 1) {
        for (let i = 0; i < rows.length; i++) {
            const discussion = await knex.select('*').from('Discussions').where('discussionID', '=', rows[i].discussionID)
            response.push(discussion[0])
        }
    }

    return {
        res: response
    }
}

const getMessagesByUserIDAndDiscussionID = async (userID, discussionID) => {
    let response = [];
    const rows = await knex.select('*').from('Discussions').where('discussionID', '=', discussionID)

    if (rows.length !== 1) {
        for (let i = 0; i < rows.length; i++) {
            const message = await knex.select('*').from('Messages').where('userID', '=', userID).where('category', '=', rows[i].category)
            response.push(message)
        }
    }

    return {
        res: response
    }
}

module.exports = { createDatabaseIfNotExist, insertUserInDatabase, insertMessageInDiscussion, getDiscussionsByUserID, getMessagesByUserIDAndDiscussionID }