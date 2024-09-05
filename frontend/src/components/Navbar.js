import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';

const NavBar = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <Navbar bg="light" expand="lg" sticky="top">
            <Navbar.Brand as={Link} to="/">MoodU</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav>
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    {token && (
                        <>
                            <Nav.Link as={Link} to="/post-mood">Post Mood</Nav.Link>
                            <Nav.Link as={Link} to="/track-mood">Track Mood</Nav.Link>
                            <Nav.Link as={Link} to="/users">Users</Nav.Link>
                            <Button variant="outline-primary" onClick={handleLogout}>Logout</Button>
                        </>
                    )}
                    {!token && (
                        <>
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                            <Nav.Link as={Link} to="/register">Register</Nav.Link>
                        </>
                    )}
                </Nav>
            </Navbar.Collapse>

            {/* Offcanvas menu for mobile */}
            <Offcanvas placement="end" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title id="offcanvasRightLabel">Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {token && (
                            <>
                                <Nav.Link as={Link} to="/post-mood">Post Mood</Nav.Link>
                                <Nav.Link as={Link} to="/track-mood">Track Mood</Nav.Link>
                                <Nav.Link as={Link} to="/users">Users</Nav.Link>
                                <Button variant="outline-primary" onClick={handleLogout}>Logout</Button>
                            </>
                        )}
                        {!token && (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </Navbar>
    );
};

export default NavBar;
