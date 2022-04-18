const fs = require('fs')
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

module.exports = { createDatabaseIfNotExist }