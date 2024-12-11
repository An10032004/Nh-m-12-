const User = require('../models/userModel')
const Chat = require('../models/chatModel')
const Post = require('../models/postModel')
const isLogin = async(req,res,next) => {
    try {
        if(req.session.user){
            const user = req.session.user
            const chat = await Chat.find({}).sort({createdAt:-1}).limit(2)
            const post = await Post.find({}).sort({createdAt:-1}).limit(7)
            const count = chat.length + post.length
            
            if(user){
                res.locals.user = user
                res.locals.chat = chat
                res.locals.post = post
                res.locals.count = count
            }
            
        }else{
            res.redirect('/')
        }
        
        next()
    } catch (error) {
        
    }
}

const isLogout = async(req,res,next) => {
    try {
        if(req.session.user){
            res.redirect('/dashboard')
        }

        next()
    } catch (error) {
        
    }
}

module.exports = {
    isLogin,
    isLogout
}