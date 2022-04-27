import { useState, useEffect } from 'react'
import { catchErrors } from '../utils'
import { getCurrentUserProfile } from '../scripts/user'
import { getCurrentUserDiscussions } from '../scripts/chat'
import { ListGroup, Navbar, Container, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap'
import { io } from 'socket.io-client'
import logo from '../images/socifyLogo.png'
import styled from 'styled-components/macro'
import '../styles/chat.css'

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
            setInputValue('')
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
                    <ListGroup defaultActiveKey='0' onSelect={(key) => changeRoom(key)} style={{height: '100vh', backgroundColor: '#000', textAlign: 'center', right: '90%', left: '0', position: 'absolute'}}>
                        {discussions.map((discussion, i) => (
                            <ListGroup.Item action eventKey={i} key={i} style={{borderRadius: '20px'}}>{discussion}</ListGroup.Item>
                        ))}
                    </ListGroup>
                    <div style={{right: '0', left: '10%', position: 'absolute'}}>
                        <ul id='messages'>
                            {messages && (
                                <>
                                    {messages.map((message, i) => (
                                        <li key={i}>{message}</li>
                                    ))}
                                </>
                            )}
                        </ul>
                        <form id='form'>
                            <input id='input' value={inputValue} onChange={(e) => setInputValue(e.target.value)}/><button onClick={(e) => sendMessage(e)}>Envoyer</button>
                        </form>
                    </div>
                </>
            )}
        </div>
    */

    /*
            <div style={{right: '0', left: '10%', position: 'absolute'}}>
                <ul id='messages'>
                </ul>
                <form id='form'>
                    <input type='text' placeholder='Salut'/><button onClick={(e) => sendMessage(e)}>Envoyer</button>
                </form>
            </div>
    */

    return (
        <div>
            <div className='homeLogo'>
                <img src={logo}/>
                <p>Socify</p>
            </div>

            <ListGroup defaultActiveKey='0' className='discussionsList'>
                <ListGroup.Item action eventKey='0' className='discussionsListItem'>
                    <img src={logo} className='discussionsListItemImg'/>
                    <p className='discussionsListItemP'>Socify</p>
                </ListGroup.Item>
            </ListGroup>

            <div className='messageList'>
                <lu style={{listStyleType: 'none', margin: '0', padding: '0', textAlign: 'left'}}>
                    <li>Test</li>
                    <li>Test</li>
                </lu>
            </div>

            <div className='sendMessage'>
                <input type='text' placeholder='Tapez votre message ici' className='sendMessageInput'/>
                <button className='sendMessageButton'>Envoyer</button>
            </div>

            <ListGroup defaultActiveKey='0' className='usersList'>
                <ListGroup.Item action eventKey='0' style={{borderRadius: '20px'}}>Test</ListGroup.Item>
            </ListGroup>
        </div>
    )
}

export default Dashboard