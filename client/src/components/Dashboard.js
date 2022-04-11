import { Tab, Nav } from 'react-bootstrap'

const Dashboard = () => {
  return (
    <Tab.Container defaultActiveKey="first">
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          <Nav.Link eventKey="first">Tab 1</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="second">Tab 2</Nav.Link>
        </Nav.Item>
      </Nav>
    </Tab.Container>
  )
}

export default Dashboard