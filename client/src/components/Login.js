import { Container } from 'react-bootstrap'
import { useState } from 'react'
import { bgStyle, imgStyle, textStyle } from '../styles/homeS' 
import logo from '../images/logo.png'
import logoh from '../images/logoh.png'

const Login = () => {
  const [hover, setHover] = useState(false)

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh'}}>
      <a href="http://localhost:8000/login" style={bgStyle(hover)} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
        <div>
          <img src={hover ? logoh : logo} alt="logo" style={imgStyle}></img>
          <p style={textStyle(hover)}>Se connecter</p>
        </div>
      </a>
    </Container>
  )
}
  
export default Login