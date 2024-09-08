const express = require('express');
const Mood = require('../models/Mood');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const jwt = require('jsonwebtoken');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId;

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    jwt.verify(token, 'secret', (err, user) => {
        //if (err) return res.status(403).json({ message: err });
        req.userId = user.userId;
        next();
    });
};

// Static routes should come before dynamic ones
// POST: /user/settings - Update mood settings for the logged-in user
router.post('/user/settings', authenticateToken, async (req, res) => {
    const userId = req.userId; // populated by the auth middleware
    const { moodSetting } = req.body;
    try {
        await User.findByIdAndUpdate(userId, { moodSetting });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error updating settings' });
    }
});

// GET: /user/settings - Get mood settings for the logged-in user
router.get('/user/settings', authenticateToken, async (req, res) => {
    const userId = req.userId; // populated by the auth middleware
    
    try {
        const user = await User.findById(userId);
        const moodSetting = user.moodSetting;
        if (!moodSetting) {
            const setting = "public"; // default to public if no setting exists
            user.moodSetting = setting;
            await user.save();
        }
        res.status(200).json({ moodSetting: user.moodSetting });
    } catch (error) {
        res.status(500).json({ error: 'Error updating settings' });
    }
});

// Dynamic routes should come after static ones
// Get all moods for a specific user
router.get('/user/:id', async (req, res) => {
  try {
      const userId = req.params.id;

      // Ensure userId is a valid ObjectId
      if (!ObjectId.isValid(userId)) {
          return res.status(400).json({ message: 'Invalid user ID' });
      }

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
                return { _id: user._id, username: user.username, latestMood, moodSetting: user.moodSetting};
            })
        );
        res.status(200).json(userMoods);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Send friend request
router.post('/friends/request', authenticateToken, async (req, res) => {
    const { recipientId } = req.body;
    const requesterId = req.userId;
    
    try {
        // Check if a request already exists between the same two users
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId, status: { $in: ['pending', 'accepted'] } },
                { requester: recipientId, recipient: requesterId, status: { $in: ['pending', 'accepted'] } }
            ]
        });

        const requester = await User.findById(requesterId);
        const recipient = await User.findById(recipientId);

        if (requester.friends.includes(recipientId) || recipient.friends.includes(requesterId)) {
            const message = "You are already friends";
            res.status(400).json({ message })
        }

        if (existingRequest) {
            const isReverseRequest = existingRequest.requester.toString() === recipientId;
            const message = isReverseRequest 
                ? 'This user has already sent you a friend request. You cannot send one back.'
                : 'Friend request already sent.';
            return res.status(400).json({ message });
        }

        if (recipientId == requesterId) {
            const message = "You cannot send friend request to yourself";
            return res.status(400).json({ message });
        }


        const newRequest = new FriendRequest({ requester: requesterId, recipient: recipientId });
        await newRequest.save();
        res.status(200).json({ message: 'Friend request sent!' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending friend request' });
    }
});


// GET: /friends/requests - Get all friend requests for the logged-in user by status
router.get('/friends/requests', authenticateToken, async (req, res) => {
    const userId = req.userId; // Get the logged-in user's ID
    const { status } = req.query; // Optional status filter (e.g., 'pending', 'accepted', 'rejected')
    
    try {
        // Find friend requests where the logged-in user is either the requester or the recipient
        const friendRequests = await FriendRequest.find({
            $or: [
                { requester: userId }, // User is the requester
                { recipient: userId }  // User is the recipient
            ],
            status: status || 'pending'  // Filter by status, default to 'pending'
        }).populate('requester', 'username') // Populate requester details (username)
          .populate('recipient', 'username'); // Populate recipient details (username)

        res.status(200).json(friendRequests);
    } catch (error) {
        console.error('Error retrieving friend requests:', error);
        res.status(500).json({ error: 'Error retrieving friend requests' });
    }
});


// Accept friend request
router.put('/friends/request/accept', authenticateToken, async (req, res) => {
    const { requestId } = req.body;

    try {
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest || friendRequest.recipient.toString() !== req.userId) {
            return res.status(400).json({ message: 'Invalid friend request' });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        // Optionally, create a new 'Friend' entry or any other logic
        // await new Friend({ user1: friendRequest.requester, user2: friendRequest.recipient }).save();

        res.status(200).json({ message: 'Friend request accepted!' });
    } catch (error) {
        res.status(500).json({ error: 'Error accepting friend request' });
    }
});

// Reject friend request
router.delete('/friends/request/reject', authenticateToken, async (req, res) => {
    const { requestId } = req.body;

   
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest || friendRequest.recipient.toString() !== req.userId) {
            return res.status(400).json({ message: 'Invalid friend request' });
        }

        await FriendRequest.findByIdAndDelete(requestId); // Remove the request from the database
        res.status(200).json({ message: 'Friend request rejected!' });
    
});



// Get all friends for user and their latest mood messages
router.get('/friends',authenticateToken, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById(userId);
    const friends = await User.find({
        _id: { $in: user.friends }
    });

    const friendMoods = await Promise.all(
        friends.map(async (friend) => {
            const latestMood = await Mood.findOne({ user: friend._id }).sort({ date: -1 });
            return { _id: friend._id, username: friend.username, latestMood, moodSetting: friend.moodSetting};
        })
    );
    res.status(200).json(friendMoods);
});

// Add friend to user
router.post('/friends/:friendId', authenticateToken, async (req, res) => {
    const userId = req.userId; // Get logged-in user's ID
    const friendId = req.params.friendId; // ID of the friend to add

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if they are already friends
        if (user.friends.includes(friendId)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        if (userId == friendId) {
            return res.status(400).json({message: 'You cannot send a friend request to yourself'});
        }

        // Add friend to user's friend list
        user.friends.push(friendId);
        await user.save();

        friend.friends.push(userId);
        await friend.save();

        res.status(200).json({ message: 'Friend added successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove friend from user
router.delete('/friends/:friendId',authenticateToken, async (req, res) => {
    const userId = req.userId; // Get logged-in user's ID
    const friendId = req.params.friendId; // ID of the friend to remove

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        // Remove friend from the user's friend list
        user.friends = user.friends.filter(friend => friend.toString() !== friendId);
        await user.save();

        friend.friends = friend.friends.filter(friend_obj => friend_obj.toString() !== friendId);
        await friend.save();

        res.status(200).json({ message: 'Friend removed successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
