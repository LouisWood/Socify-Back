import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from '../components/Dashboard'
import Login from '../components/Login'

const Home = () => {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    setConnected(document.cookie.indexOf('id=') === 0)
  }, [document.cookie]);

  return (
    connected ? <Dashboard /> : <Login />
  )
}

export default Home