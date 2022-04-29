import { useState, useEffect } from 'react'
import { catchErrors } from '../utils'
import { getCurrentUserProfile } from '../scripts/user'
import { getCurrentUserDiscussions, getCurrentUserMessages } from '../scripts/chat'
import { ListGroup } from 'react-bootstrap'
import { io } from 'socket.io-client'
import logo from '../images/socifyLogo.png'
import logoAdd from '../images/socifyAdd.png'
import '../styles/chat.css'

const socket = io.connect('http://localhost:8000')
const Dashboard = () => {
    const [profile, setProfile] = useState(null)
    const [discussions, setDiscussions] = useState(null)
    const [room, setRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')

    const sendMessage = (e) => {
        e.preventDefault()

        if (inputValue && profile && discussions) {
            socket.emit('sendMessage', {
                name: profile.display_name,
                category: discussions[room].category,
                content: inputValue
            })
            setInputValue('')
        }
    }
    
    const changeRoom = (newRoom) => {
        if (room) {
            socket.emit('leaveRoom', [room, profile.display_name])
            setMessages([])
        }
        
        if (profile) {
            socket.emit('joinRoom', [newRoom, profile.display_name])
            setRoom(newRoom)
        }
    }

    const changeDiscussion = (e, i) => {
        if ('active' in e.target.parentElement.classList)
            return
        
        document.querySelectorAll('ul.discussionsList button.active').forEach(function(item) {
            item.classList.remove('active')
        })

        e.target.parentElement.classList.add('active')

        changeRoom(i)
    }

    const addDiscussion = (e) => {
        if ('active' in e.target.parentElement.classList)
            return
        
        document.querySelectorAll('ul.discussionsList button.active').forEach(function(item) {
            item.classList.remove('active')
        })

        e.target.parentElement.classList.add('active')
    }

    useEffect(() => {
        const fetchData = async () => {
            const userProfile = await getCurrentUserProfile()
            setProfile(userProfile)

            const userDiscussions = await getCurrentUserDiscussions()
            setDiscussions(userDiscussions)

            const userMessages = await getCurrentUserMessages()
            setDiscussions(userMessages)
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
                        {discussions.map((discussion, i) => {
                            if (i === 0) {
                                return (
                                    <li key={discussion.discussionID}>
                                        <button onClick={(e) => changeDiscussion(e, discussion.discussionID)} className='active'>
                                            <img src={discussion.picture} alt='logo'/>
                                            <p>{discussion.category}</p>
                                        </button>
                                    </li>
                                )
                            }
                            return (
                                <li key={discussion.discussionID}>
                                    <button onClick={(e) => changeDiscussion(e, discussion.discussionID)}>
                                        <img src={discussion.picture} alt='logo'/>
                                        <p>{discussion.category}</p>
                                    </button>
                                </li>
                            )
                        })}
                    </>
                )}
                <li key={-1}>
                    <button onClick={addDiscussion}>
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