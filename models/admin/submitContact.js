const mongoose = require('mongoose')

const submitSchema = new mongoose.Schema({
    adminName:String,    
    userMessageDate:{
        type:Date,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    
    DateAt: { type: Date, default: Date.now }

},
    {timestamps:true}
)

module.exports = mongoose.model('Submit',submitSchema)