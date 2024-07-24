const mongoose = require('mongoose');


const triggerSchema = mongoose.Schema({
	createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'} ,
    triggerType: String,
    pipeDriveWebHookId: String,
    creationDate: String,
    lastUpdateDate:String,

});

const Trigger = mongoose.model('triggers', triggerSchema);
module.exports = Trigger;