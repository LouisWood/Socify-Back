const { createDatabaseIfNotExist, insertUserInDatabase } = require('./modules/database')
const { getArtistTopTracks, getTracksInfo, getPlaylistByID } = require('./modules/music')
const { checkIfTokenIsExpired, getAccessToken } = require('./modules/token')
const { getUserInfo, getCurrentUserPlaylists, getCurrentUserTopArtists, getCurrentUserTopTracks, setCurrentUserPlaylist, fillCurrentUserPlaylist } = require('./modules/user')

const express = require('express')
const cors = require ('cors')
const cookieParser = require('cookie-parser')
const cookieEncrypter = require('cookie-encrypter')
const { URLSearchParams } = require('url')

require('dotenv').config()

const app = express()

const corsOptions = {
    origin:'http://localhost:3000',
    credentials:true,
    optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser(process.env.SECRET_KEY))
app.use(cookieEncrypter(process.env.SECRET_KEY))

app.get('/', (req, res) => {
    res.redirect('http://localhost:3000/')
})

app.get('/login', (req, res) => {
    const storedID = req.signedCookies ? req.signedCookies['userID'] : null
    
    if (storedID) {
        res.redirect('http://localhost:3000/')
        return
    }

    const randomNumber = Math.random().toString()
    const state = randomNumber.substring(2, randomNumber.length)

    res.cookie('state', state, {signed: true})

    const params = new URLSearchParams()

    params.set('client_id', process.env.CLIENT_ID)
    params.set('response_type', 'code')
    params.set('redirect_uri', encodeURI(process.env.REDIRECT_URI))
    params.set('state', state)
    params.set('scope', process.env.SCOPE)
    
    res.redirect('https://accounts.spotify.com/authorize?' + params)
})

app.get('/callback', async (req, res) => {
    const storedID = req.signedCookies ? req.signedCookies['userID'] : null

    if (storedID) {
        res.redirect('http://localhost:3000/')
        return
    }

    const code = req.query.code
    const state = req.query.state
    const error = req.query.error
    const storedState = req.signedCookies ? cookieParser.signedCookie(req.signedCookies['state'], process.env.SECRET_KEY) : null
    
    if (!error || state === storedState) {
        res.clearCookie('state')

        const resToken = await getAccessToken(code)

        if ('res' in resToken) {
            const resUser = await getUserInfo(resToken.res.access_token)

            if ('res' in resUser)
                await insertUserInDatabase(res, resUser.res, resToken.res)
        }
    }
    res.redirect('http://localhost:3000/')
})

app.post('/me', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
    const response = await getUserInfo(access_token)
    
    res.json(response)
})

app.post('/me/playlists', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return

    const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
    const response = await getCurrentUserPlaylists(access_token)
    
    res.json(response)
})

app.post('/me/top/artists', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return

    const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
    const response = await getCurrentUserTopArtists(access_token)
    
    res.json(response)
})

app.post('/me/top/tracks', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return

    const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
    const response = await getCurrentUserTopTracks(access_token)
    
    res.json(response)
})

app.post('/users/me/playlists', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if (req.signedCookies['userID'] && 'playlistName' in req.body && 'playlistDesc' in req.body) {
        const userID = cookieParser.signedCookie(req.signedCookies['userID'], process.env.SECRET_KEY)
        const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
        const playlistName = req.body.playlistName
        const playlistDesc = req.body.playlistDesc
        const response = await setCurrentUserPlaylist(userID, access_token, playlistName, playlistDesc)

        res.json(response)
    } else {
        res.json({
            error: 'error'
        })
    }
})

app.post('/playlists/playlistID/tracks', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('playlistID' in req.body && 'tracksUris' in req.body) {
        const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
        const playlistID = req.body.playlistID
        const tracksUris = req.body.tracksUris
        const response = await fillCurrentUserPlaylist(access_token, playlistID, tracksUris)
        
        res.json(response)
    } else {
        res.json({
            error: 'error'
        })
    }
})

app.post('/artists/artistID/top-tracks', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('artistID' in req.body) {
        const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
        const artistID = req.body.artistID
        const response = await getArtistTopTracks(access_token, artistID)
        
        res.json(response)
    } else {
        res.json({
            error: 'error'
        })
    }
})

app.post('/audio-features/trackID', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('trackID' in req.body) {
        const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
        const trackID = req.body.trackID
        const response = await getTracksInfo(access_token, trackID)
        
        res.json(response)
    } else {
        res.json({
            error: 'error'
        })
    }
})

app.post('/playlists/playlistID', async (req, res) => {
    const exit = await checkIfTokenIsExpired(req, res)
    if (exit)
        return
    
    if ('playlistID' in req.body) {
        const access_token = cookieParser.signedCookie(req.signedCookies['access_token'], process.env.SECRET_KEY)
        const playlistID = req.body.playlistID
        const response = await getPlaylistByID(access_token, playlistID)
        
        res.json(response)
    } else {
        res.json({
            error: 'error'
        })
    }
})

app.get('*', (req, res) => {
    res.redirect('http://localhost:3000/')
})

app.listen(8000, async () => {
    console.log('Listening on port 8000')
    await createDatabaseIfNotExist()
})


/*
const store = new KnexSessionStore({
    knex: knex,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 60 * 60 * 1000
})

app.use(session({
    secret: process.env.process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}))
*/