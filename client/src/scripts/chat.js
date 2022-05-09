import axios from 'axios'

export const getCurrentUserLastDiscussion = async () => {
    const response = await axios.get('/lastDiscussion')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserDiscussions = async () => {
    const response = await axios.get('/discussions')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserMessages = async (discussionID) => {
    const response = await axios.post('/messages', {
        discussionID: discussionID
    })
    return 'res' in response.data ? response.data.res : null
}

export const setCurrentUserLastDiscussion = async (discussionID) => {
    await axios.post('/lastDiscussion', {
        discussionID: discussionID
    })
}