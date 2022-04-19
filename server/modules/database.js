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
      table.string('name')
      table.string('picture')
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
  }
}

const insertUserInDatabase = async (res, userData, tokenData) => {
  const currentTime = new Date()
  const expireTime = new Date(currentTime.getTime() + 55 * 60 * 1000)
  const picture = userData.images.length > 0 ? userData.images[0].url : ''

  res.cookie('userID', userData.id, {signed: true})
  res.cookie('access_token', tokenData.data.access_token, {signed: true})
  res.cookie('refresh_token', tokenData.data.refresh_token, {signed: true})
  res.cookie('expireTime', expireTime.toString(), {signed: true})

  const rows = await knex('Users').select('*').where('userID', '=', userData.id)

  if (rows.length !== 1) {
    await knex('Users').insert({userID: userData.id, name: userData.display_name, picture: picture})
  }
}

module.exports = { createDatabaseIfNotExist, insertUserInDatabase }