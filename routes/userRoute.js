//Setting express
const express = require('express')
const bodyParser = require('body-parser')
const user_route = express()
const moment = require('moment')

user_route.locals.moment = moment
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

user_route.set('view engine','ejs')
user_route.set('views','./views')

user_route.use(express.static('public'))

const session = require('express-session')
const {SESSION_SECRET} = process.env
user_route.use(session({secret:SESSION_SECRET}))

const path = require("path")
const multer = require('multer')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/images'))
    },
    filename:function(req,file,cb){
        const name = Date.now() + '-' + file.originalname
        cb(null,name)
    }
})
const upload = multer({storage:storage})

//route connect to userController
const userController = require('../controllers/userController')
const auth = require("../middlewares/auth")
//cookie
const cookieParser = require('cookie-parser')
user_route.use(cookieParser())

user_route.get('/register',auth.isLogout,userController.registerload)
user_route.post('/register',upload.single('image'),userController.register)

user_route.get('/',auth.isLogout,userController.loadLogin)
user_route.post('/',userController.login)

user_route.get('/logout',auth.isLogin,userController.logout)
user_route.get('/dashboard',auth.isLogin,userController.loadDashboard)

user_route.post('/save-chat',userController.saveChat)

user_route.delete('/delete-chat',userController.deleteChat)
user_route.patch('/update-chat',userController.updateChat)


user_route.get('/groups',auth.isLogin,userController.loadGroups)
user_route.post('/groups',upload.single('image'),userController.createGroup)

user_route.post('/get-members',auth.isLogin,userController.getMembers)
user_route.post('/add-members',auth.isLogin,userController.addMembers)



user_route.get('/posts',auth.isLogin,userController.getPost)
user_route.get('/create-post',auth.isLogin,userController.loadPost)
user_route.post('/create-post',upload.single('image'),auth.isLogin,userController.submitPost)



//api check PostMan
user_route.get('/testApi',userController.getApi)
user_route.patch('/updateApi',userController.editApi)


module.exports = user_route
