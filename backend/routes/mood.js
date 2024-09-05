const express = require('express');
const Mood = require('../models/Mood');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId;

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    jwt.verify(token, 'secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.userId = user.userId;
        next();
    });
};

// Post Mood
router.post('/post', authenticateToken, async (req, res) => {
    const { mood, message } = req.body;
    try {
        const existingMood = await Mood.findOne({ user: req.userId, date: { $gte: new Date().setHours(0, 0, 0, 0) } });
        if (existingMood) return res.status(400).json({ message: 'You can only post one mood per day' });

        const newMood = new Mood({ user: req.userId, mood, message });
        await newMood.save();
        res.status(201).json({ message: 'Mood posted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Users and Latest Mood
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        const userMoods = await Promise.all(
            users.map(async (user) => {
                const latestMood = await Mood.findOne({ user: user._id }).sort({ date: -1 });
                return { username: user.username, latestMood };
            })
        );
        res.status(200).json(userMoods);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all moods for a specific user
router.get('/user/:id', async (req, res) => {
  try {
      const userId = req.params.id;

      // Find all moods for the given userId and sort them by creation date (descending)
      const moods = await Mood.find({ user: userId }).sort({ date: -1 });

      if (!moods || moods.length === 0) {
          return res.status(404).json({ message: 'No mood history found for this user.' });
      }

      res.json(moods);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error });
  }
});

module.exports = router;
