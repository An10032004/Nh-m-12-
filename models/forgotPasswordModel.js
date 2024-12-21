const mongoose = require('mongoose')

const forgotPasswordSchema = new mongoose.Schema({
    email:String,
    otp:String,
    expireAt:{
        type:Date,
        expires:180,
    },
    
},{
        timestamps:true
    })

module.exports = mongoose.model('ForgotPassword',forgotPasswordSchema)