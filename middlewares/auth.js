const isLogin = async(req,res,next) => {
    try {
        if(req.session.user){

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