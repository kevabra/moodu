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

    // Filter users to display only those whose moodSetting is "public"
    const publicUsers = users.filter(user => /*user.latestMood &&*/ user.moodSetting === 'public' /*|| user.username === localStorage.getItem('username')*/);

    return (
        <div className="users-container">
            <h1>All Users</h1>
            <div className="user-list">
                {publicUsers.length > 0 ? (
                    publicUsers.map((publicUser, index) => (
                        <div className="user-card" key={index}>
                            <h3>{publicUser.username}</h3>
                            {publicUser.latestMood ? (
                                <p><strong>Latest Mood:</strong> {publicUser.latestMood.mood}</p>
                            ) : (
                                <p>No mood message posted yet.</p>
                            )}
                            {publicUser.latestMood && (
                                <p><strong>Message:</strong> {publicUser.latestMood.message}</p>
                            )}
                            {publicUser.latestMood && (
                                <p><i>{new Date(publicUser.latestMood.date).toLocaleDateString()}</i></p>
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
