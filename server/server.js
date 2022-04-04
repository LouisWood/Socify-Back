const client_id = '43aa644597e44cdfb605b31a5f27aa3a'
const client_secret = 'c71b5fef68404b9eb73b16600c12cb2b'
const redirect_uri = 'http://localhost:8000/callback'
const scope = 'user-read-private user-read-email user-read-recently-played'
const stateKey = 'spotify_auth_state'
const dbPath = './.data/statify.db'
const PORT = 8000
const SECRET_KEY = 'p2s5v8y/B?E(G+KbPeShVmYq3t6w9z$C'

const express = require('express')
const cors = require ('cors')
const cookieParser = require('cookie-parser')
const cookieEncrypter = require('cookie-encrypter')
const { URLSearchParams } = require('url')
const axios = require('axios').default
const fs = require("fs")

const dbExist = fs.existsSync(dbPath)

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
})

/*
const store = new KnexSessionStore({
  knex: knex,
  tablename: 'sessions',
  sidfieldname: 'sid',
  createtable: true,
  clearInterval: 60 * 60 * 1000
})
*/

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser(SECRET_KEY))
app.use(cookieEncrypter(SECRET_KEY))

/*
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 60 * 60 * 1000
  }
}))
*/

app.get('/', (req, res) => {
  res.redirect('http://localhost:3000/')
})

app.get('/login', (req, res) => {
  const storedId = req.cookies ? cookieParser.signedCookie(req.signedCookies['id'], SECRET_KEY) : null

  if (storedId) {
    res.redirect('http://localhost:3000/')
    return
  }

  const randomNumber = Math.random().toString()
  const state = randomNumber.substring(2, randomNumber.length)

  res.cookie(stateKey, state, {signed: true})

  const params = new URLSearchParams()

  params.set('client_id', client_id)
  params.set('response_type', 'code')
  params.set('redirect_uri', encodeURI(redirect_uri))
  params.set('state', state)
  params.set('scope', scope)
  
  res.redirect('https://accounts.spotify.com/authorize?' + params)
})

app.get('/callback', (req, res) => {
  const storedId = req.cookies ? cookieParser.signedCookie(req.signedCookies['id'], SECRET_KEY) : null

  if (storedId) {
    res.redirect('http://localhost:3000/')
    return
  }

  const code = req.query.code
  const state = req.query.state
  const error = req.query.error
  const storedState = req.cookies ? cookieParser.signedCookie(req.signedCookies[stateKey], SECRET_KEY) : null
  
  if (error || state !== storedState) {
    res.redirect('http://localhost:3000/')
  } else {
    res.clearCookie(stateKey)

    axios.post(
      'https://accounts.spotify.com/api/token', null, {
        params: {
          code: code,
          redirect_uri: encodeURI(redirect_uri),
          grant_type: 'authorization_code'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret, 'utf-8').toString('base64')
        }
      }
    )
    .then((resToken) => {
      requestUserId(req, res, resToken.data)
    })
    .catch(() => {
      res.redirect('http://localhost:3000/')
    })
  }
})

//app.get('/profil', requestUserInformation)

//app.get('/logout', logoutUser)

app.post('/home', (req, res) => {
  //return all data to be shown
})

app.get('*', (req, res) => {
  res.redirect('http://localhost:3000/')
})

function requestUserId(req, res, resToken) {
  axios.get(
    'https://api.spotify.com/v1/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + resToken.access_token
      }
    }, null
  )
  .then((resUser) => {
    insertUserDatabase(req, res, resUser.data.id, resToken)
  })
  .catch((err) => {
    console.log(err)
    res.redirect('http://localhost:3000/')
  })
}

async function insertUserDatabase(req, res, userId, resToken) {
  const rows = await knex('Users').select('*').where('userId', '=', userId)

  //console.log(rows)

  if (rows.length !== 1) {
    const currentTime = new Date();
    const expireTime = new Date(currentTime.getTime() + 55 * 60 * 1000);
    await knex('Users').insert({userId: userId, access_token: resToken.access_token, refresh_token: resToken.refresh_token, expireTime: expireTime.toString()}).then(() => {tmpDB()})
  }
  
  res.cookie('id', userId, {signed: true})

  res.redirect('http://localhost:3000/')
}

async function createDatabase() {
  if (!dbExist) {
    await knex.schema.createTable('Users', function (table) {
      table.string('userID').primary().notNullable()
      table.string('access_token')
      table.string('refresh_token')
      table.string('expireTime')
    })
    await knex.schema.createTable('Friends', function (table) {
      table.string('userID').notNullable()
      table.string('friendID').notNullable()
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

async function tmpDB() {
  const rows = await knex('Users').select('*')
  console.log(rows);
}

app.listen(PORT, async () => {
  console.log("Listening on port " + PORT)
  await createDatabase()
})