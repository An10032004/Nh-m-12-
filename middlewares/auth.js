const User = require('../models/userModel')
const isLogin = async(req,res,next) => {
    try {
        if(req.session.user){
            const user = req.session.user
            if(user){
                res.locals.user = user
            }
            console.log(user)
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