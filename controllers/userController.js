const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const Chat = require('../models/chatModel')
const Group = require('../models/groupModel')
const Post = require('../models/postModel')
const { MongoMissingCredentialsError } = require('mongodb')
const { post } = require('../routes/userRoute')
const registerload = async(req,res) => {
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message)
    }
}

const register = async(req,res) => {
    try {
        
        const userModel =   new User({
            name : req.body.name,
            email: req.body.email,
            image:'image/' + req.file.filename,
            password:req.body.password
        })

        await userModel.save()

        res.render('register',{message:'registration success'})
    } catch (error) {
        
    }
}

const loadLogin = async(req,res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const login = async(req,res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({
            email:email,
            password:password
        })
        
        if(userData){
            req.session.user = userData
            res.cookie('user',JSON.stringify(userData))
            res.redirect('/dashboard')
        }else{
            res.render('login',{message:"Email and password are incorrect"})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req,res) => {
    try {
        res.clearCookie('user')
        req.session.destroy()
        res.redirect('/')
        res.status(200).json({success:true,msg:'Logouted'})

    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async(req,res) => {
    try {
        var users = await User.find({_id: {
            $nin:[req.session.user._id]
        }})
        res.render('dashboard',{user:req.session.user,users:users})
    } catch (error) {
        console.log(error.message)
    }
}

const saveChat =async (req,res) => {
    try {
        var chat = new Chat({
            sender_id:req.body.sender_id,
            receiver_id:req.body.receiver_id,
            message:req.body.message
        })

        var newChat = await chat.save()
        res.status(200).send({success:true,msg:'Chat inserted!',data:newChat})
      
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
        
    }
}


const deleteChat = async (req,res) => {
    try {
        await Chat.deleteOne({_id:req.body.id})
        res.status(200).json({success:true})
        

    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const updateChat = async (req,res) => {
    try {
       

        await Chat.findByIdAndUpdate({_id:req.body.id},{
            $set:{
                message:req.body.message
            }
        }
        )
       
        res.status(200).json({success:true})
       
    } catch (error) {
        res.status(400).json({success:false,msg:error.message})
    }
}

const loadGroups = async (req,res) => {
    try {
        const groups = await Group.find({ creator_id: req.session.user._id })
        
        res.render('group',{groups:groups})
        res.json(groups)
    } catch (error) {
        console.log(error.message)
    }
}
const createGroup = async (req,res) => {
    try {
        const group = new Group({
            creator_id:req.session.user._id,
            name:req.body.name,
            image:'images/' +req.file.filename,
            limit:req.body.limit
        })
        
        await group.save()
        const groups = await Group.find({ creator_id: req.session.user._id })
        
        res.render('group',{message:req.body.name + ' Group successfull created',groups:groups})
    } catch (error) {
        console.log(error.message)
    }
}


const getMembers = async (req,res) => {
    try {
        
        var users = await User.find({ _id: { $nin:req.session.user._id}})

        res.status(200).send({success:true,data:users})

    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const getApi = async (req,res) =>{
    const user = await User.find({
        is_online:'0'
    })
    res.json(user)
}
const editApi = async (req,res) =>{
        const id = "672628466f20caa2d3e2606d"
    try {
        await User.updateOne({
            _id:id
        },
        {is_online:"1"}
    )
        res.status(200).json({success:true})
    } catch (error) {
        res.status(400).json({success:false,msg:error.message})
    }
}


const getPost = async (req,res) => {

    const posts = await Post.find({}).sort({DateAt:-1}).limit(4)



    res.render('post',{posts:posts})
}

const loadPost = async (req,res) => {
    res.render('createPost')
}

const submitPost = async (req,res) => {
    const title = req.body.title
    const content = req.body.content 
    const popular = req.body.popular  
    const users = await User.find({})
    


    var name
    for(const user of users){
        if(user._id == req.session.user._id){
            name = user.name
        }
        
    }
    const post = new Post({
        userName:name,
        user_id_upload:req.session.user._id,
        title:title,
        content:content,
        popular:popular,
        image:'images/' + req.file.filename,
        DateAt:new Date()
    })
    
   
    
   
     const postData =  await post.save()

    res.render('createPost',{message:'Post added'})
}



module.exports = {
    registerload,
    register,
    loadLogin,
    login,
    logout,
    loadDashboard,
    saveChat,
    deleteChat,
    updateChat,
    loadGroups,
    getMembers,
    createGroup,
    getApi,
    editApi,
    getPost,
    loadPost,
    submitPost,
   
}