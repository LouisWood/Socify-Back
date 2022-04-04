import Dashboard from '../components/Dashboard'
import Login from '../components/Login'

const Home = () => {
  return (
    document.cookie.indexOf('userId=') === 0 ? <Dashboard /> : <Login />
  )
}

export default Home