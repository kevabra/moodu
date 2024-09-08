import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
    const [moodSetting, setMoodSetting] = useState('public');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const token = localStorage.getItem('token');
    useEffect(() => {
        // Fetch the current user's settings on component mount
        axios.get(`${process.env.REACT_APP_API_URL}/mood/user/settings`, 
            {headers: { Authorization: token }})
        .then(response => {
            setMoodSetting(response.data.moodSetting);
        });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!token) {
            setError('Settings could not be modified.');
            return;
        }
        axios.post(`${process.env.REACT_APP_API_URL}/mood/user/settings`,
            { moodSetting },  // Payload (second argument)
            { headers: { Authorization: token} } // Token goes in headers (third argument)
        )
        .then(response => {
            setSuccess('Settings saved successfully.');
        })
        .catch(error => {
            setError('Settings could not be modified.');
        });
  };

    return (
        <div>
            <h2>Settings</h2>
            <div className="settings-container">
                <label>Mood Message Visibility</label>
                <select value={moodSetting} onChange={(e) => setMoodSetting(e.target.value)}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends-only">Friends Only</option>
                </select>
                <button onClick={handleSave}>Save</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </div>
        </div>
    );
};

export default Settings;
