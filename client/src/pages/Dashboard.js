import { useState, useEffect } from 'react'
import { catchErrors } from '../utils'
import { getCurrentUserProfile } from '../scripts/user'
import { getCurrentUserLastDiscussion, getCurrentUserDiscussions, getCurrentUserMessages, setCurrentUserLastDiscussion } from '../scripts/chat'
import { ListGroup } from 'react-bootstrap'
import { io } from 'socket.io-client'
import logo from '../images/socifyLogo.png'
import logoAdd from '../images/socifyAdd.png'
import '../styles/chat.css'

const socket = io.connect('http://localhost:8000', {withCredentials: true})
const Dashboard = () => {
    const [profile, setProfile] = useState(null)
    const [discussions, setDiscussions] = useState(null)
    const [currentDiscussion, setCurrentDiscussion] = useState(-1)
    const [room, setRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')

    const sendMessage = (e) => {
        e.preventDefault()

        if (inputValue && profile && discussions) {
            socket.emit('sendMessage', {
                name: profile.display_name,
                discussion: discussions[room].name,
                content: inputValue
            })
            setInputValue('')
        }
    }
    
    const changeRoom = (newRoom) => {
        if (room) {
            socket.emit('leaveRoom', {
                room: room
            })
            setMessages([])
        }
        
        if (profile) {
            socket.emit('joinRoom', {
                room: newRoom
            })
            setRoom(newRoom)
        }
    }

    const changeDiscussion = async (e, discussionID) => {
        if ('active' in e.target.parentElement.classList)
            return
        
        document.querySelectorAll('ul.discussionsList button.active').forEach(function(item) {
            item.classList.remove('active')
        })

        e.target.parentElement.classList.add('active')
        
        await setCurrentUserLastDiscussion(discussionID)
        setCurrentDiscussion(discussionID)
        changeRoom(discussionID)
    }

    const addDiscussion = async e => {
        if ('active' in e.target.parentElement.classList)
            return
        
        document.querySelectorAll('ul.discussionsList button.active').forEach(function(item) {
            item.classList.remove('active')
        })

        e.target.parentElement.classList.add('active')

        await setCurrentUserLastDiscussion(-1)
        setCurrentDiscussion(-1)
    }

    useEffect(() => {
        const fetchData = async () => {
            const userProfile = await getCurrentUserProfile()
            setProfile(userProfile)

            const userLastDiscussion = await getCurrentUserLastDiscussion()
            setCurrentDiscussion(userLastDiscussion.lastDiscussion)

            const userDiscussions = await getCurrentUserDiscussions()
            setDiscussions(userDiscussions)

            if (userLastDiscussion !== -1) {
                const userMessages = await getCurrentUserMessages(userLastDiscussion)
                setMessages(userMessages)
            }
        }
        catchErrors(fetchData())
    }, [])

    useEffect(() => {
        if (profile && discussions && discussions.length > 0)
            changeRoom(discussions[0].discussionID)
    }, [profile, discussions])

    useEffect(() => {
        socket.on('receiveMessage', (msg) => {
            if (msg)
                setMessages((messages) => [...messages, msg])
        })
    }, [socket])

    return (
        <div>
            <div className='homeLogo'>
                <img src={logo} alt='logo'/>
                <p>Socify</p>
            </div>

            <ul className='discussionsList'>
                {discussions && (
                    <>
                        { discussions.friends.length > 0 && (
                            <>
                                {discussions.friends.map(discussion => (
                                    <li key={discussion.discussionID}>
                                        <button onClick={(e) => changeDiscussion(e, discussion.discussionID)} className={discussion.discussionID === currentDiscussion ? 'active' : ''}>
                                            <img src={discussion.picture} alt='logo'/>
                                            <p>{discussion.name}</p>
                                        </button>
                                    </li>
                                ))}
                            </>
                        )}
                        { discussions.discussions.length > 0 && (
                            <>
                                {discussions.discussions.map(discussion => (
                                    <li key={discussion.discussionID}>
                                        <button onClick={(e) => changeDiscussion(e, discussion.discussionID)} className={discussion.discussionID === currentDiscussion ? 'active' : ''}>
                                            <img src={discussion.picture} alt='logo'/>
                                            <p>{discussion.name}</p>
                                        </button>
                                    </li>
                                ))}
                            </>
                        )}
                    </>
                )}
                
                <li key={-1}>
                    <button onClick={addDiscussion} className={currentDiscussion === -1 ? 'active' : ''}>
                        <img src={logoAdd} alt='logo'/>
                        <p>Ajouter</p>
                    </button>
                </li>
            </ul>

            <div className='messageList'>
                <ul style={{listStyleType: 'none', margin: '0', padding: '0', textAlign: 'left'}}>
                    {messages && (
                        <>
                            {messages.map((message, i) => (
                                <li key={i}>
                                    <ul>
                                        {message}
                                    </ul>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            </div>

            <div className='sendMessage'>
                <input type='text' placeholder='Tapez votre message ici' className='sendMessageInput' value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}/>
                <button className='sendMessageButton' onClick={sendMessage}>Envoyer</button>
            </div>

            <ListGroup defaultActiveKey='0' className='usersList'>
                <ListGroup.Item action eventKey='0' style={{borderRadius: '20px'}}>Test</ListGroup.Item>
                <ListGroup.Item action eventKey='1' style={{borderRadius: '20px'}}>Test</ListGroup.Item>
            </ListGroup>
        </div>
    )
}

export default Dashboard