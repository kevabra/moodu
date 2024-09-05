import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Table, Alert } from 'react-bootstrap';

const TrackMood = () => {
    const [moods, setMoods] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
        if (!token) {
            setError('You must be logged in to view your mood history. Redirecting to login page...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            const fetchMoods = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/mood/user/${userId}`, {
                        headers: { Authorization: token },
                    });
                    setMoods(response.data);
                } catch (err) {
                    setError('Failed to fetch mood data.');
                }
            };
            fetchMoods();
        }
    }, [navigate]);

    return (
        <Container>
            {error && <Alert variant="danger">{error}</Alert>}
            {!error && (
                <>
                    <h2>Your Mood History</h2>
                    {moods.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Mood</th>
                                    <th>Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moods.map((mood) => (
                                    <tr key={mood._id}>
                                        <td>{new Date(mood.date).toLocaleDateString()}</td>
                                        <td>{mood.mood}</td>
                                        <td>{mood.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>No mood history available.</p>
                    )}
                </>
            )}
        </Container>
    );
};

export default TrackMood;
