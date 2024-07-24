const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
	pipedriveUserId: String,
    googleUserId: String,
    pipedriveToken:String,
    googleToken:String,
    registrationDate: Date
});

const User = mongoose.model('users', userSchema);
module.exports = User;