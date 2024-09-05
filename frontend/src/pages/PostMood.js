import React, { useState } from 'react';
import axios from 'axios';

const PostMood = () => {
    const [moodData, setMoodData] = useState({ mood: '', message: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setMoodData({ ...moodData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to post a mood.');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/mood/post`, moodData, {
                headers: {
                    Authorization: token,
                },
            });
            setSuccess('Mood posted successfully!');
            setMoodData({ mood: '', message: '' });
        } catch (error) {
            setError('Error posting mood. You may have already posted today.');
        }
    };

    return (
        <div className="post-mood-container">
            <h1>Post Your Mood</h1>
            <form className="post-mood-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="mood"
                    placeholder="Mood (e.g., Happy, Sad)"
                    onChange={handleChange}
                    value={moodData.mood}
                    required
                />
                <textarea
                    name="message"
                    placeholder="Describe your mood..."
                    onChange={handleChange}
                    value={moodData.message}
                    required
                />
                <button type="submit">Post Mood</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </form>
        </div>
    );
};

export default PostMood;
