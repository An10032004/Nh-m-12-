const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const Chat = require('../models/chatModel')
const Group = require('../models/groupModel')
const GroupChat = require('../models/groupChatModel')
const Post = require('../models/postModel')
const Member = require('../models/memberModel')
const { MongoMissingCredentialsError } = require('mongodb')
const { post } = require('../routes/userRoute')
const mongoose = require('mongoose')
const searchHelper = require("../helpers/search");
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
            image:'images/' + req.file.filename,
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
            $nin:[req.session.user._id],
            
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
        const group_id =new mongoose.Types.ObjectId(req.body.group_id)
        const userId =new  mongoose.Types.ObjectId(req.session.user._id)
        console.log(group_id)
        var users = await User.aggregate([
            {
                $lookup:{
                    from:"members",
                    localField:"_id",
                    foreignField:"user_id",
                    pipeline:[
                        {
                            $match:{
                            $expr:{
                                $and:[
                                    {$eq:["$group_id",group_id]}
                                    
                                ]
                            }
                        }
                    }],
                    as:"member"
                }
            },
            {
                $match:{
                    "_id":{
                        $nin:[userId]
                    }
                }
            }
        ]
        )

        res.status(200).send({success:true,data:users})

    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const addMembers = async (req,res) => {
    try {
        
        if(!req.body.members){
            res.status(200).send({success:false,msg:"Please select any one Member"})


        }else if(req.body.members.length > parseInt(req.body.limit) ){
            res.status(200).send({success:false,msg:"Member limited! (" + req.body.limit + ")"})
        }else{

            await Member.deleteMany({group_id:req.body.group_id})
            var data = []

            const members = req.body.members
           
            for(let i = 0 ; i < members.length;i++){
                data.push({
                    group_id:req.body.group_id,
                    user_id:members[i]
                })
            }
            await Member.insertMany(data)

            res.status(200).send({success:true,msg:"Member added"})

        }
        

    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}




const updateChatGroup = async (req,res) => {
    try {
        
        if(parseInt(req.body.limit) < parseInt(req.body.last_limit)){
                await Member.deleteMany({group_id:req.body.id})
        }

        var uploadObj;

        if(req.file != undefined){
            updateObj = {
                name:req.body.name,
                image: 'image/'+ req.file.filename,
                limit:req.body.limit
            }
        }
        else{
            updateObj = {
                name:req.body.name,
                limit:req.body.limit
            }
        }
        
        await Group.findByIdAndUpdate({_id:req.body.id},{
            $set:updateObj
        })

        res.status(200).send({success:true,msg:'Group updated!'})

        

    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}


const deleteChatGroup = async (req,res) => {
    try {
        await Group.deleteOne({_id:req.body.id})
        await Member.deleteMany({group_id:req.body.id})
        
        res.status(200).send({success:true,msg:'Group Deleted!'})

        

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

const shareGroup = async (req,res) => {
    try {
        var groupData = await Group.findOne({ _id: req.params.id})
        if(!groupData){
            res.render('error',{message:'404 not found'})
        }else if(req.session.user == undefined){
            res.render('error',{message:'You need to login to access this Url'})

        }else{
            var totalMembers = await Member.find({group_id:req.params.id}).countDocuments()
            var available = groupData.limit - totalMembers

            var isOwner = groupData.creator_id == req.session.user._id ? true:false
            var isJoined =  await Member.find({group_id:req.params.id,user_id:req.session.user._id}).countDocuments()

            res.render('shareLink',{group:groupData,totalMembers:totalMembers,isOwner:isOwner,isJoined:isJoined,available:available})


        }
    } catch (error) {
        console.log(error.message)
    }
}

const joinGroup = async (req,res) => {
    try {

        const member = new Member({
            group_id:req.body.group_id ,
            user_id:req.session.user._id
        })
        await member.save()
        res.send({success:true,msg:'Welcome to group'})
        
    } catch (error) {
        res.send({success:false,msg:error.message})
    }
}

const groupChat = async (req,res) => {
    try {
        const myGroups = await Group.find({creator_id:req.session.user._id})
        const joinedGroups = await Member.find({user_id:req.session.user._id}).populate('group_id')    

        res.render('chat-group',{myGroups:myGroups,joinedGroups:joinedGroups})
     } catch (error) {
        console.log(error.message)
    }
}

const searchName = async (req, res) => {
    try {
        const keyword = req.body.name;
        const users = await User.find({
            name: { $regex: keyword, $options: 'i' }, 
        });
        res.render('search', { users }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const saveGroupChat = async (req, res) => {
    try {
        var chat =  new GroupChat({
            sender_id:req.body.sender_id,
            group_id:req.body.group_id,
            message:req.body.message
        })

        var newChat = await chat.save()
        var cChat = await GroupChat.findOne({_id:newChat._id}).populate('sender_id')
        res.send({success:true,chat:cChat})
    } catch (error) {
        res.send({success:false,msg:error.message})
    }
};
const loadGroupChat = async (req, res) => {
    try {
        const groupChats = await  GroupChat.find({group_id:req.body.group_id}).populate('sender_id')
        res.send({success:true,chats:groupChats})
    } catch (error) {
        res.send({success:false,msg:error.message})
    }
};

const deleteGroupChat = async (req, res) => {
    try {
         await  GroupChat.deleteOne({_id:req.body.id})
        res.send({success:true,msg:'Chat deleted '})
    } catch (error) {
        res.send({success:false,msg:error.message})
    }
};

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
    addMembers,
    createGroup,
    updateChatGroup,
    deleteChatGroup,
    shareGroup,
    joinGroup,
    groupChat,
    saveGroupChat,
    loadGroupChat,
    deleteGroupChat,    
    searchName,
    getApi,
    editApi,
    getPost,
    loadPost,
    submitPost,
   
}