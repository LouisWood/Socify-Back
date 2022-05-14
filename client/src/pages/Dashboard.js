import { useState, useEffect } from 'react'
import { catchErrors } from '../utils'
import { getCurrentUserProfile } from '../scripts/user'
import { getCurrentUserLastDiscussion, getCurrentUserDiscussions, getCurrentUserDiscussionMessages, getDiscussionUsersStatus, setCurrentUserLastDiscussion } from '../scripts/chat'
import { ListGroup } from 'react-bootstrap'
import { io } from "socket.io-client"
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
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [scrollPosition, setScrollPosition] = useLocalStorage('scrollPosition', -1)
    const [users, setUsers] = useState([])

    const handleScroll = e => {
        let element = e.target
        if (element.scrollHeight - element.scrollTop === element.clientHeight)
            setScrollPosition(-1)
        else
            setScrollPosition(element.scrollTop)
    }

    const sendMessage = e => {
        e.preventDefault()

        if (inputValue && profile && discussions) {
            socket.emit('sendMessage', {
                name: profile.display_name,
                discussionID: currentDiscussion,
                content: inputValue
            })
            setInputValue('')
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
        
        await setCurrentUserLastDiscussion(index)
        setCurrentDiscussion(index)
        setMessages(i === -1 ? [] : await getCurrentUserDiscussionMessages(index))
    }

    useEffect(() => {
        const fetchData = async () => {
            const userProfile = await getCurrentUserProfile()
            setProfile(userProfile)

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
            const element = document.getElementById('messageList')
            element.scrollTop = element.scrollHeight
        })
        return <></>
    }

    const ScrollToPosition = () => {
        useEffect(() => {
            const element = document.getElementById('messageList')
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
                    <div className='messageList' onScroll={handleScroll} id='messageList'>
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
                        <input type='text' placeholder='Tapez votre message ici' className='sendMessageInput' value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}/>
                        <button className='sendMessageButton' onClick={sendMessage}>Envoyer</button>
                    </div>

                    <ListGroup defaultActiveKey='0' className='usersList'>
                        <ListGroup.Item action eventKey='0' style={{borderRadius: '20px'}}>Test</ListGroup.Item>
                        <ListGroup.Item action eventKey='1' style={{borderRadius: '20px'}}>Test</ListGroup.Item>
                    </ListGroup>
                </>
            ) :
                <>

                </>
            }
        </div>
    )
}

export default Dashboard