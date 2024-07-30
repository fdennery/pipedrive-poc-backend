const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
	pipedrive_user_id: String,
    google_user_id: String,
    pipedrive_refresh_token:String,
    google_refresh_token:String,
    registration_date: {type:Date,default:Date.now()}
});

const User = mongoose.model('users', userSchema);
module.exports = User;