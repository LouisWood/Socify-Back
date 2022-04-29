import axios from 'axios'

export const getCurrentUserDiscussions = async () => {
    const response = await axios.get('/discussions')
    return 'res' in response.data ? response.data.res : null
}

export const getCurrentUserMessages = async () => {
    const response = await axios.get('/messages')
    return 'res' in response.data ? response.data.res : null
}