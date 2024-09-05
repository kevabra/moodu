import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response =  await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, formData);
            setSuccess('Registration successful. Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Redirect to login after 2 seconds
        } catch (error) {
            setError('Username already exists or registration failed.');
        }
    };

    return (
        <div className="auth-container">
            <h1>Register</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    value={formData.username}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    value={formData.password}
                    required
                />
                <button type="submit">Register</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </form>
        </div>
    );
};

export default Register;
