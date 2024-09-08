const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    moodSetting: {
        type: String,
        enum: ['public', 'private', 'friends-only'],
        default: 'public'
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Referencing the User model for friends
            default: []
        }
    ]
});
module.exports = mongoose.model('User', UserSchema);

