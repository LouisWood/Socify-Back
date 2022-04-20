import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button, ListGroup } from 'react-bootstrap'

const Dashboard = () => {
    const handleClick = () => {
        
    }

    return (
        <>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className="">
                <Container>
                    <Nav className="ms-auto">
                        <Navbar.Brand href="/">Socify</Navbar.Brand>
                    </Nav>
                    <Nav className="mx-auto">
                        <Form className="d-flex">
                            <FormControl type="search" placeholder="Rechercher" className="me-2" aria-label="Search"/>
                            <Button variant="outline-success">Rechercher</Button>
                        </Form>
                    </Nav>
                    <Nav className="mr-auto">
                        <NavDropdown title="Profil" id="collasible-nav-dropdown">
                            <NavDropdown.Item href="/profile">Mon compte</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="http://localhost:8000/logout">Se déconnecter</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>
            <ListGroup defaultActiveKey="1" className="text-center" style={{width: '10%', height: '100%', backgroundColor: "#AAAAAA"}}>
                <ListGroup.Item className="rounded-3 d-inline p-2" action eventKey="1" onClick={handleClick}>Discussions 1</ListGroup.Item>
                <ListGroup.Item className="rounded-3 d-inline p-2" action eventKey="2" onClick={handleClick}>Discussions 2</ListGroup.Item>
            </ListGroup>
        </>
    )
}

export default Dashboard