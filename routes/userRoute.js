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
user_route.post('/groups',upload.single('image'),auth.isLogin,userController.createGroup)

user_route.post('/get-members',auth.isLogin,userController.getMembers)
user_route.post('/add-members',auth.isLogin,userController.addMembers)

user_route.post('/update-chat-group',upload.single('image'),auth.isLogin,userController.updateChatGroup)
user_route.post('/delete-chat-group',auth.isLogin,userController.deleteChatGroup)


user_route.get('/posts',auth.isLogin,userController.getPost)
user_route.get('/create-post',auth.isLogin,userController.loadPost)
user_route.post('/create-post',upload.single('image'),auth.isLogin,userController.submitPost)

user_route.get('/share-group/:id',auth.isLogin,userController.shareGroup)
user_route.post('/join-group',auth.isLogin,userController.joinGroup)
user_route.get('/group-chat',auth.isLogin,userController.groupChat)
user_route.post('/group-chat-save',auth.isLogin, userController.saveGroupChat); 
user_route.post('/load-group-chats',auth.isLogin, userController.loadGroupChat); 
user_route.post('/delete-group-chats',auth.isLogin, userController.deleteGroupChat); 


//contact
user_route.get('/contact',auth.isLogin,userController.contact)
user_route.post('/contact-post',upload.single('image'),auth.isLogin,userController.contactPost)

//search
user_route.post('/search',auth.isLogin, userController.searchName); 


//games
games = {};
user_route.get('/games',auth.isLogin,userController.Game)
user_route.get('/white',auth.isLogin, (req, res) => {
    res.render('ingame', {
        color: 'white'
    });
});
user_route.get('/black',auth.isLogin, (req, res) => {
    console.log(games[req.query.code])
    if (!games[req.query.code]) {
        return res.redirect('/?error=invalidCode');
    }



    res.render('ingame', {
        color: 'black'
    });
});




user_route.get('/game2',auth.isLogin,(req,res) => {
    res.render('game2')
})
user_route.get('/game3',auth.isLogin,(req,res) => {
    res.render('game3')
})

//comments
user_route.post('/comments/:id',upload.single('image'),auth.isLogin, userController.Comment); 
user_route.post('/like/:id',upload.single('image'),auth.isLogin, userController.Like); 

//friends
user_route.get('/friend',upload.single('image'),auth.isLogin, userController.Friend)
user_route.post('/addFriend/:id',upload.single('image'),auth.isLogin, userController.addFriend)

//api check PostMan
user_route.get('/testApi',userController.getApi)
user_route.patch('/updateApi',userController.editApi)




module.exports = user_route
