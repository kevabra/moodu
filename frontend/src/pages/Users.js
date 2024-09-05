import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/mood/users`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="users-container">
            <h1>All Users</h1>
            <div className="user-list">
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <div className="user-card" key={index}>
                            <h3>{user.username}</h3>
                            {user.latestMood ? (
                                <p><strong>Latest Mood:</strong> {user.latestMood.mood}</p>
                            ) : (
                                <p>No mood message posted yet.</p>
                            )}
                            {user.latestMood && (
                                <p><strong>Message:</strong> {user.latestMood.message}</p>
                            )}
                            {user.latestMood && (
                                <p><i>{new Date(user.latestMood.date).toLocaleDateString()}</i></p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </div>
        </div>
    );
};

export default Users;
