import { useState, useEffect } from 'react'
import { catchErrors } from '../utils'
import { getCurrentUserProfile } from '../scripts/user'
import { getCurrentUserDiscussions } from '../scripts/chat'
import '../styles/chat.css'
import { ListGroup, Navbar, Container, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap'
import { io } from 'socket.io-client'

const socket = io.connect('http://localhost:8000')
const Dashboard = () => {
    const [profile, setProfile] = useState(null)
    const [discussions, setDiscussions] = useState(null)
    const [room, setRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const userProfile = await getCurrentUserProfile()
            setProfile(userProfile)

            const discussions = await getCurrentUserDiscussions()
            setDiscussions(discussions)

            if (userProfile && discussions) {
                socket.emit('joinRoom', ['0', userProfile.display_name])
                setRoom('0')
                setProfile(userProfile)
            }
        }
        catchErrors(fetchData())

        if (profile) {
            socket.emit('sendMessage', [inputValue, profile.display_name])
            setInputValue("")
        }
    }, [])

    const sendMessage = (e) => {
        e.preventDefault()
        console.log(inputValue)
        console.log(profile)
        if (inputValue && profile) {
            socket.emit('sendMessage', {
                message: inputValue,
                name: profile.display_name
            })
            setInputValue("")
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

    useEffect(() => {
        socket.on('receiveMessage', (msg) => {
            if (msg)
                setMessages((messages) => [...messages, msg])
        })
    }, [socket])

    /*
        <div>
            {discussions && (
                <>
                    <ListGroup defaultActiveKey="0" onSelect={(key) => changeRoom(key)} style={{height: '100vh', backgroundColor: '#000', textAlign: 'center', right: '90%', left: '0', position: 'absolute'}}>
                        {discussions.map((discussion, i) => (
                            <ListGroup.Item action eventKey={i} key={i} style={{borderRadius: '20px'}}>{discussion}</ListGroup.Item>
                        ))}
                    </ListGroup>
                    <div style={{right: '0', left: '10%', position: 'absolute'}}>
                        <ul id="messages">
                            {messages && (
                                <>
                                    {messages.map((message, i) => (
                                        <li key={i}>{message}</li>
                                    ))}
                                </>
                            )}
                        </ul>
                        <form id="form">
                            <input id="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)}/><button onClick={(e) => sendMessage(e)}>Envoyer</button>
                        </form>
                    </div>
                </>
            )}
        </div>
    */

    /*
            <div style={{right: '0', left: '10%', position: 'absolute'}}>
                <ul id="messages">
                </ul>
                <form id="form">
                    <input type='text' placeholder='Salut'/><button onClick={(e) => sendMessage(e)}>Envoyer</button>
                </form>
            </div>
    */

    const discussionsListStyle = {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        right: '85%',
        backgroundColor: '#272525',
        textAlign: 'center',
        borderRight: '1px solid #000'
    }

    const bodyStyle = {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '15%',
        right: '15%',
        textAlign: 'center',
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000'
    }

    const usersListStyle = {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '85%',
        right: '0',
        backgroundColor: '#272525',
        textAlign: 'center',
        borderLeft: '1px solid #000'
    }

    return (
        <div>
            <ListGroup defaultActiveKey="0" style={discussionsListStyle}>
                    <ListGroup.Item action eventKey="0" style={{borderRadius: '20px'}}>Test</ListGroup.Item>
            </ListGroup>

            <div style={bodyStyle}>

            </div>

            <ListGroup defaultActiveKey="0" style={usersListStyle}>
                    <ListGroup.Item action eventKey="0" style={{borderRadius: '20px'}}>Test</ListGroup.Item>
            </ListGroup>
        </div>
    )
}

export default Dashboard