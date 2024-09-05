import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Home = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
    }, []);

    return (
        <Container fluid className="home-container">
            <Row className="justify-content-center">
                <Col md={8} lg={6} className="text-center">
                    <h1>Welcome to MoodU</h1>
                    {username && <h2>Hello, {username}!</h2>}
                    <p>This is your personal mood tracking app. Post your daily moods and track your emotional journey!</p>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
