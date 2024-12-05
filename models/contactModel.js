const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    userName:String,
    user_id_upload:{
        type:String,
        required:true,
    },   
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
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

module.exports = mongoose.model('Contact',contactSchema)