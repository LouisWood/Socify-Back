import axios from 'axios'

export const getCurrentUserLastDiscussion = async () => {
    const response = await axios.get('/lastDiscussion')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserDiscussions = async () => {
    const response = await axios.get('/discussions')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserDiscussionMessages = async discussionID => {
    const response = await axios.post('/messages', {
        discussionID: discussionID
    })
    return 'res' in response.data ? response.data.res : null
}

export const getDiscussionUsersStatus = async discussionID => {
    const response = await axios.post('/usersStatus', {
        discussionID: discussionID
    })
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserDiscussionScrollPosition = async discussionID => {
    const response = await axios.post('/lastScrollPosition', {
        discussionID: discussionID,
    })
    return 'res' in response.data ? response.data.res : null
}

export const setCurrentUserLastDiscussion = async lastDiscussion => {
    await axios.post('/lastDiscussion', {
        lastDiscussion: lastDiscussion
    })
}

export const setCurrentUserDiscussionScrollPosition = async (discussionID, scrollPosition) => {
    await axios.post('/scrollPosition', {
        discussionID: discussionID,
        scrollPosition: scrollPosition
    })
}

export const searchUsersAndDiscussions = async name => {
    const response = await axios.post('/search', {
        name: name
    })
    return 'res' in response.data ? response.data.res : null
}