const mongoose = require('mongoose')
const friendSchema = new mongoose.Schema({
    ownId:{
        type:String,
        required:true,
    },   
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_online:{
        type:String,
        default:'0'
    },
    isFriend: {
        type: String,
        default: '0'
      },
    deleted: {
        type: Boolean,
        default: false
      },
},
    {timestamps:true}
)
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_online:{
        type:String,
        default:'0'
    },
    deleted: {
        type: Boolean,
        default: false
      },
    friends: { type: [friendSchema], default: [] }
},
    {timestamps:true}
)

module.exports = mongoose.model('User',userSchema)