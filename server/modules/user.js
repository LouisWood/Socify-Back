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
    await knex('Users').insert({userID: userData.id, name: userData.display_name, picture: picture})
  }

  res.redirect('http://localhost:3000/')
}

axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Content-Type'] = 'application/json';

const getUserInfo = async (access_token) => {
  const response = await axios.get('/me', {
    headers: {
      Authorization: 'Bearer ' + access_token
    }
  })
  .then(resUser => {
    return {
      data: resUser.data
    }
  })
  .catch(() => {
    return {
      error: 'error'
    }
  })

  return response
}

const getUserPlaylists = async (access_token) => {
  const limit = 20

  const response = await axios.get(`/me//playlists?limit=${limit}`, {
    headers: {
      Authorization: 'Bearer ' + access_token
    }
  })
  .then(resUser => {
    return {
      data: resUser.data
    }
  })
  .catch(() => {
    return {
      error: 'error'
    }
  })

  return response
}

const getCurrentUserTopArtists = async (access_token) => {
  const time_range = 'short_term'

  const response = await axios.get(
    `/me/top/artists?time_range=${time_range}`, {
    headers: {
      Authorization: 'Bearer ' + access_token
    }
  })
  .then(resUser => {
    return {
      data: resUser.data
    }
  })
  .catch(() => {
    return {
      error: 'error'
    }
  })

  return response
}

const getCurrentUserTopTracks = async (access_token) => {
  const time_range = 'short_term'

  const response = await axios.get(
    `/me/top/tracks?time_range=${time_range}`, {
    headers: {
      Authorization: 'Bearer ' + access_token
    }
  })
  .then(resUser => {
    return {
      data: resUser.data
    }
  })
  .catch(() => {
    return {
      error: 'error'
    }
  })

  return response
}

const setCurrentUserPlaylist = async (userID, access_token, playlistName, playlistDesc) => {
  const response = await axios.post(
    `/users/${userID}/playlists`, {
    headers: {
      Authorization: 'Bearer ' + access_token
    },
    name: playlistName,
    description: playlistDesc
  })
  .then(resUser => {
    return {
      data: resUser.data
    }
  })
  .catch(() => {
    return {
      error: 'error'
    }
  })

  return response
}

const fillCurrentUserPlaylist = async (access_token, playlistID, tracksUris) => {
}

module.exports = { insertUserInDatabase, getUserInfo, getUserPlaylists, getCurrentUserTopArtists, getCurrentUserTopTracks, setCurrentUserPlaylist, fillCurrentUserPlaylist }