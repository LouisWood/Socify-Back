import Dashboard from '../components/Dashboard'
import Login from '../components/Login'

const Home = () => {
  return (
    document.cookie.indexOf('userID=') !== -1 ? <Dashboard /> : <Login />
  )
}

export default Home