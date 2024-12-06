//Setting express
const express = require('express')

const admin_route = express()
const bodyParser = require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:false}))
const flash = require('express-flash');
var methodOverride = require("method-override");
admin_route.use(methodOverride("_method"));
admin_route.set('view engine','pug')
admin_route.set('views','./views')

const moment = require('moment')

admin_route.locals.moment = moment

admin_route.use(express.static('public'))

const session = require('express-session')
const {SESSION_SECRET} = process.env
admin_route.use(session({secret:SESSION_SECRET}))

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

//flass
admin_route.use(flash())

const upload = multer({storage:storage})
const cookieParser = require('cookie-parser')
admin_route.use(cookieParser())

const adminController = require('../controllers/adminController')
const validate = require("../middlewares/auth")
const authMiddleware = require(
    "../middlewares/auth/auth.middleware"
)


admin_route.get("/ad/dashboard",authMiddleware.requireAuth,adminController.dashboard)
admin_route.get("/ad/accounts",authMiddleware.requireAuth,adminController.indexAccount)
admin_route.get("/ad/accounts/create",authMiddleware.requireAuth,adminController.createAccount)
admin_route.post("/ad/accounts/create",upload.single('avatar'),adminController.createPostAccount)


admin_route.get("/ad/roles",authMiddleware.requireAuth,adminController.indexRole)
admin_route.get("/ad/roles/create",authMiddleware.requireAuth,adminController.createRole)
admin_route.post("/ad/roles/create",adminController.createPostRole)

admin_route.get("/ad/roles/permissions",authMiddleware.requireAuth,adminController.permissions)
admin_route.patch("/ad/roles/permissions",authMiddleware.requireAuth,adminController.permissionsPatch)

admin_route.get("/ad/login",adminController.login)

admin_route.post('/ad/login',  adminController.loginPost)
admin_route.get('/ad/logout', adminController.logout)


admin_route.get('/ad/posts',authMiddleware.requireAuth, adminController.Post)
admin_route.get('/ad/charts',authMiddleware.requireAuth, adminController.Chart)


admin_route.get('/ad/notifications',authMiddleware.requireAuth, adminController.Note)
admin_route.get('/ad/maps',authMiddleware.requireAuth, adminController.Map)


admin_route.get('/ad/contact',authMiddleware.requireAuth, adminController.Contact)
admin_route.post('/ad/submitContact',upload.single('avatar'),authMiddleware.requireAuth, adminController.submitContact)



admin_route.post('/ad/accountChange/:id',upload.single('avatar'),authMiddleware.requireAuth, adminController.accountChange)
admin_route.post('/ad/accountChange2/:id',upload.single('avatar'),authMiddleware.requireAuth, adminController.accountChange2)

admin_route.get("/ad/test",adminController.api)

module.exports = admin_route
