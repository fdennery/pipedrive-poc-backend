const mongoose = require('mongoose');


const triggerSchema = mongoose.Schema({
	triggeredBy: {type: mongoose.Schema.Types.ObjectId, ref: 'triggers'} ,
    messageContent: String,
    webHookContent: String,
    sucess: Boolean,
    error: String,
    creationDate: String,

});

const Trigger = mongoose.model('triggers', triggerSchema);
module.exports = Trigger;