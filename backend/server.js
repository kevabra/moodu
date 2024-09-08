const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/mood');
const dotenv = require('dotenv');

const User = require('./models/User');

dotenv.config()

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// one-time migration script (ensure new fields are incorporated into all users )
const addMoodSettingFieldToUsers = async () => {
  try {
      // Find all users where moodSetting does not exist
      const users = await User.find({ moodSetting: { $exists: false } });

      for (let user of users) {
          user.moodSetting = 'public'; // Default to 'public' or whichever default setting
          await user.save();
          console.log(`Updated user ${user.username} with default moodSetting.`);
      }

      console.log('All users updated.');
      process.exit();
  } catch (error) {
      console.error('Error updating users:', error);
      process.exit(1);
  }
};

// one-time migration script (ensure new fields are incorporated into all users )
const addFriendsFieldToUsers = async () => {
  try {
      // Find all users where friends field does not exist
      const users = await User.find({ friends: { $exists: false } });

      for (let user of users) {
          user.friends = []; // Default to empty array or whichever default setting
          await user.save();
          console.log(`Updated user ${user.username} with default friends list.`);
      }

      console.log('All users updated.');
      process.exit();
  } catch (error) {
      console.error('Error updating users:', error);
      process.exit(1);
  }
};