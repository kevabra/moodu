import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostMood from './pages/PostMood';
import Users from './pages/Users';
import TrackMood from './pages/TrackMood';
import './App.css'; // Ensure custom styles are imported
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const PrivateRoute = ({ element: Component, ...rest }) => {
    const isLoggedIn = !!localStorage.getItem('token');
    return isLoggedIn ? <Component {...rest} /> : <Navigate to="/login" />;
};

const App = () => {
    return (
        <Router>
            <div className="App">
                <NavBar />
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/post-mood" element={<PrivateRoute element={PostMood} />} />
                        <Route path="/track-mood" element={<PrivateRoute element={TrackMood} />} />
                        <Route path="/users" element={<Users />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
