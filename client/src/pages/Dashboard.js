import { useState, useEffect } from 'react'
import { catchErrors } from '../utils'
import { getCurrentUserProfile } from '../scripts/user'
import { getCurrentUserLastDiscussion, getCurrentUserDiscussions, getCurrentUserDiscussionMessages, getDiscussionUsersStatus, getCurrentUserDiscussionScrollPosition, setCurrentUserLastDiscussion, setCurrentUserDiscussionScrollPosition,searchUsersAndDiscussions } from '../scripts/chat'
import { io } from 'socket.io-client'
import { useLocalStorage } from '../hook/localStorage'
import logo from '../images/socifyLogo.png'
import logoAdd from '../images/socifyAdd.png'
import socifyDefault from '../images/socifyDefault.png'
import '../styles/chat.css'

const socket = io('http://localhost:8000', {withCredentials: true})

const Dashboard = () => {
    const [profile, setProfile] = useState(null)
    const [discussions, setDiscussions] = useState(null)
    const [currentDiscussion, setCurrentDiscussion] = useState(-1)
    const [messages, setMessages] = useState(null)
    const [inputValueMessage, setInputValueMessage] = useState('')
    const [scrollPosition, setScrollPosition] = useLocalStorage('scrollPosition', -1)
    const [users, setUsers] = useState(null)
    const [inputValueSearch, setInputValueSearch] = useState('')
    const [searchResponse, setSearchResponse] = useState(null)

    const handleScroll = e => {
        let element = e.target
        if (element.scrollHeight - element.scrollTop === element.clientHeight || element.scrollHeight > element.clientHeight)
            setScrollPosition(-1)
        else
            setScrollPosition(element.scrollTop)
    }

    const sendMessage = e => {
        e.preventDefault()

        if (inputValueMessage && profile) {
            socket.emit('sendMessage', {
                name: profile.display_name,
                discussionID: currentDiscussion,
                content: inputValueMessage
            })
            setInputValueMessage('')
        }
    }

    const search = async e => {
        e.preventDefault()
        
        if (inputValueSearch) {
            console.log(await searchUsersAndDiscussions(inputValueSearch))
            setInputValueSearch('')
        }
    }

    const changeDiscussion = async (e, i) => {
        if ('active' in e.target.parentElement.classList)
            return
        
        document.querySelectorAll('ul.discussionsList button.active').forEach(function(item) {
            item.classList.remove('active')
        })

        e.target.parentElement.classList.add('active')

        const index = i === -1 ? -1 : discussions[i].discussionID

        if (currentDiscussion !== -1)
            await setCurrentUserDiscussionScrollPosition(currentDiscussion, scrollPosition)
        
        if (index !== -1) {
            setUsers(await getDiscussionUsersStatus(index))
            setScrollPosition(await getCurrentUserDiscussionScrollPosition(index))
        }

        await setCurrentUserLastDiscussion(index)
        setCurrentDiscussion(index)
        setMessages(i === -1 ? [] : await getCurrentUserDiscussionMessages(index))
    }

    useEffect(() => {
        const fetchData = async () => {
            setProfile(await getCurrentUserProfile())

            const userLastDiscussion = await getCurrentUserLastDiscussion()
            setCurrentDiscussion(userLastDiscussion)

            const userDiscussions = await getCurrentUserDiscussions()
            setDiscussions(userDiscussions)
            
            if (userDiscussions.length > 0) {
                socket.emit('initDiscussions')
            }

            if (userLastDiscussion !== -1) {
                const userMessages = await getCurrentUserDiscussionMessages(userLastDiscussion)
                setMessages(userMessages)

                const usersStatus = await getDiscussionUsersStatus(userLastDiscussion)
                setUsers(usersStatus)

                const userScrollPosition = await getCurrentUserDiscussionScrollPosition(userLastDiscussion)
                setScrollPosition(userScrollPosition)
            }
        }
        catchErrors(fetchData())
    }, [])

    useEffect(() => {
        socket.on('receiveMessage', data => {
            if (currentDiscussion === data.discussionID) {
                setMessages((messages) => [...messages, data])
            } else {

            }
        })
    }, [socket, currentDiscussion])

    const ScrollToBottom = () => {
        useEffect(() => {
            const element = document.getElementById('messagesList')
            element.scrollTop = element.scrollHeight
        })
        return <></>
    }

    const ScrollToPosition = () => {
        useEffect(() => {
            const element = document.getElementById('messagesList')
            element.scrollTop = scrollPosition
        })
        return <></>
    }

    return (
        <div>
            <div className='homeLogo'>
                <img src={logo} alt='logo'/>
                <p>Socify</p>
            </div>

            <ul className='discussionsList'>
                {discussions && (
                    <>
                        { discussions.length > 0 && (
                            <>
                                {discussions.map((discussion, i) => (
                                    <li key={discussion.discussionID}>
                                        <button onClick={e => changeDiscussion(e, i)} className={discussion.discussionID === currentDiscussion ? 'active' : ''}>
                                            <img src={discussion.picture === '' ? socifyDefault : discussion.picture} alt='avatar'/>
                                            <p>{discussion.name}</p>
                                        </button>
                                    </li>
                                ))}
                            </>
                        )}
                    </>
                )}
                
                <li key={-1}>
                    <button onClick={e => changeDiscussion(e, -1)} className={currentDiscussion === -1 ? 'active' : ''}>
                        <img src={logoAdd} alt='avatar'/>
                        <p>Ajouter</p>
                    </button>
                </li>
            </ul>

            {currentDiscussion !== -1 ? (
                <>
                    <div className='messagesList' onScroll={handleScroll} id='messagesList'>
                        <ul>
                            {messages && (
                                <>
                                    {messages.map((message, i) => (
                                        <li key={i}>
                                            <ul>
                                                <img src={message.picture === '' ? socifyDefault : message.picture} alt='avatar' className='picture'/>
                                                <p className='name'>{message.name}</p>
                                                <p className='date'>{message.date}</p>
                                                <p className='content'>{message.content}</p>
                                            </ul>
                                        </li>
                                    ))}
                                    {scrollPosition === -1 ? <ScrollToBottom/> : <ScrollToPosition/>}
                                </>
                            )}
                        </ul>
                    </div>

                    <div className='sendMessage'>
                        <input type='text' placeholder='Tapez votre message ici' className='sendMessageInput' value={inputValueMessage} onChange={e => setInputValueMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}/>
                        <button className='sendMessageButton' onClick={sendMessage}>Envoyer</button>
                    </div>

                    <div className='usersList' id='usersList'>
                        <ul>
                            {users && (
                                <>
                                    {users.connected && users.connected.length > 0 && (
                                        <>
                                            <p className='usersStatus'>{`En ligne - ${users.connected.length}`}</p>
                                            {users.connected.map((user, i) => (
                                                <li key={i}>
                                                    <ul>
                                                        <img src={user.picture === '' ? socifyDefault : user.picture} alt='avatar' className='picture'/>
                                                        <p className='name'>{user.name}</p>
                                                        <p className='date'>{user.date}</p>
                                                    </ul>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                    {users.disconnected && users.disconnected.length > 0 && (
                                        <>
                                            <p className='usersStatus'>{`Hors ligne - ${users.disconnected.length}`}</p>
                                            {users.disconnected.map((user, i) => (
                                                <li key={i}>
                                                    <ul>
                                                        <img src={user.picture === '' ? socifyDefault : user.picture} alt='avatar' className='picture'/>
                                                        <p className='name'>{user.name}</p>
                                                        <p className='date'>{user.date}</p>
                                                    </ul>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                </>
            ) :
                <>
                    <button className='createDiscussion'>Créer une discussion</button>
                    <div className='trendDiscussion'>
                        <p className='title'>Discussions en tendances</p>
                        <ul></ul>
                    </div>
                    <div className='exploreDiscussion'>
                        <p className='title'>Explorez la communauté</p>
                        <p className='titleDescription'>Recherchez une discussion ou une personne.</p>
                        <div className='searchDiscussion'>
                            <input type='text' className='searchInput' placeholder='Que recherchez vous ?' value={inputValueSearch} onChange={e => setInputValueSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' ? search(e) : null}/>
                            <button type='submit' className='searchButton' onClick={search}><i className='fa fa-search'/></button>
                        </div>
                        <ul></ul>
                    </div>
                </>
            }
        </div>
    )
}

export default Dashboard