import { Container } from 'react-bootstrap'
import '../styles/login.css'

const Login = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh'}}>
      <a href="http://localhost:8000/login" className="button">
        <div>
          <img alt="logo" className="img"></img>
          <p className="text">Se connecter</p>
        </div>
      </a>
    </Container>
  )
}
  
export default Login