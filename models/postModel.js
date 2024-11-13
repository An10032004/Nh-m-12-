const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    userName:String,
    user_id_upload:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    popular:String,
    DateAt: { type: Date, default: Date.now }

},
    {timestamps:true}
)

module.exports = mongoose.model('Post',postSchema)