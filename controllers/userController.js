const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const Chat = require('../models/chatModel')
const Group = require('../models/groupModel')
const GroupChat = require('../models/groupChatModel')
const Post = require('../models/postModel')
const Member = require('../models/memberModel')
const Contact = require('../models/contactModel')
const submitContact = require('../models/admin/submitContact')
const { MongoMissingCredentialsError } = require('mongodb')
const { post } = require('../routes/userRoute')
const mongoose = require('mongoose')
const searchHelper = require("../helpers/search");
const generate = require("../helpers/generate")
const SendMail = require("../helpers/sendMail")
const ForgotPass = require("../models/forgotPasswordModel")
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
            password:password,
            deleted:false
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
        
        const you = req.session.user._id
        var user = await User.findOne({_id:you})
    
        const usersWithFriendStatus = users.map(userItem => {
            // Kiểm tra xem userItem._id có nằm trong mảng user.friends
            const friendStatus = user.friends.find(friend => friend.ownId.toString() === userItem._id.toString());
    
            return {
                ...userItem.toObject(), // Chuyển đổi từ Mongoose document sang plain object
                isFriendStatus: friendStatus ? friendStatus.isFriend : 'not-friend' , // Thêm trường isFriend vào đối tượng userItem
            };
        });
       

        res.render('dashboard',{user:req.session.user,users:usersWithFriendStatus})

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
    const chats = await Group.find({})

    res.json(chats)
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

    let objpagination = {
        current:1,
        limit : 2
    }
    if(req.query.page){
        objpagination.current = parseInt(req.query.page)
    }
    objpagination.skip = (objpagination.current - 1 )*objpagination.limit

    const count = await Post.countDocuments({})
    const totalPages =  Math.ceil(count/objpagination.limit)
    objpagination.totalPages = totalPages
    const posts = await Post.find({}).sort({DateAt:-1}).limit(objpagination.limit).skip(objpagination.skip)

    const users = await User.find({})

    res.render('post',{posts:posts,pagination:objpagination,users:users})
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

const contact = async (req, res) => {
    try {
        const contacts = await Contact.find({user_id_upload:req.session.user._id}).sort({DateAt:-1})
        const submits = await submitContact.find({})
    
      
       
  
      // Prepare an array of userMessageDate timestamps for quick lookup
      const contactsWithSubmits = contacts.map(contact => {
        // Convert contact DateAt to a comparable format (without milliseconds)
        const contactDate = contact.DateAt.toISOString().split('.')[0]; // Remove milliseconds
  
        // Find the corresponding submit that matches the contact date
        const matchingSubmit = submits.find(submit => {
            const submitDate = submit.userMessageDate.toISOString().split('.')[0]; // Remove milliseconds
            return submitDate === contactDate; // Compare dates
        });
  
        // Determine if there is a matching submit and get the adminName and message if it exists
        const hasSubmit = !!matchingSubmit; // Check if a matching submit was found
        const adminName = hasSubmit ? matchingSubmit.adminName : null; // Get adminName if exists
        const messages = hasSubmit ? matchingSubmit.message : null; // Get message if exists
        const Date = hasSubmit ? matchingSubmit.DateAt : null; // Get message if exists
  
        return {
            ...contact.toObject(), // Convert Mongoose document to plain object
            hasSubmit, // Add a flag to indicate if there's a matching submit
            adminName, // Add adminName to the contact object
            messages, // Add message to the contact object
            Date
        };
    });
    console.log(contactsWithSubmits)
        res.render('contact',{contacts: contacts,
            submits:submits,
            contactsWithSubmits:contactsWithSubmits}); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const contactPost = async (req, res) => {
    
        const name = req.body.name
        const email = req.body.email
        const message = req.body.message
        const id = req.session.user._id
        const phone = req.body.phone
       
        
        const contact = new Contact({
            userName:name,
            user_id_upload:id,
            email:email,
            message:message,
            phone:phone,
            DateAt:new Date(),
        })
        const connects = await contact.save()
       
        res.render('contact',{message:'Contact sended'})

};

const Comment = async (req, res) => {
    const comment = req.body.commentContent
    const postId =req.params.id
    const userId = req.session.user._id
    const userName = req.session.user.name
   
    try {

        await Post.updateOne(
            { _id: postId },
            { $push: { comments: { content: comment, userName, userId } } }
        );
       
        res.redirect(`/posts`); // Hoặc `/posts` nếu bạn muốn quay lại danh sách
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const Like = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await Post.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
        res.redirect('/posts')
    } catch (err) {
        console.log(err);
        
    }
};

const Friend = async (req, res) => {
    var users = await User.find({_id: {
        $nin:[req.session.user._id],
        
    }})
    const you = req.session.user._id
    var user = await User.findOne({_id:you})

    const usersWithFriendStatus = users.map(userItem => {
        // Kiểm tra xem userItem._id có nằm trong mảng user.friends
        const friendStatus = user.friends.find(friend => friend.ownId.toString() === userItem._id.toString());

        return {
            ...userItem.toObject(), // Chuyển đổi từ Mongoose document sang plain object
            isFriendStatus: friendStatus ? friendStatus.isFriend : 'not-friend' , // Thêm trường isFriend vào đối tượng userItem
        };
    });

    console.log(usersWithFriendStatus); // Kiểm tra thông tin


    res.render('friend',{users:users,senderId:you,usersWithFriendStatus})
};

const addFriend = async (req, res) => {
    const friendId =req.params.id
    const yourId = req.session.user._id

    
    try {
        const friend = await User.findOne({_id:friendId})
       
        await User.updateOne(
            { _id: yourId },
            { $push: { friends: { 
                ownId:friendId,
                name:friend.name,
                email:friend.email,
                image:friend.image,
                is_online:friend.is_online,
                isFriend:'sent',
                deleted: friend.deleted,
             } } }
        );

        const you = await User.findOne({_id:yourId})

        await User.updateOne(
            { _id: friendId },
            { $push: { friends: { 
                ownId:yourId,
                name:you.name,
                email:you.email,
                image:you.image,
                is_online:you.is_online,
                isFriend:'pending',
                deleted: you.deleted,
             } } }
        );
       
        res.redirect(`/friend`); // Hoặc `/posts` nếu bạn muốn quay lại danh sách
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

const acceptFriend = async (req, res) => {
    const userId = req.session.user._id;
    const friendId = req.params.id;

    try {
        // Cập nhật trạng thái kết bạn thành 'accepted' cho cả hai người
        await User.updateOne(
            { _id: userId, 'friends.ownId': friendId },
            { $set: { 'friends.$.isFriend': 'accepted' } }
        );

        await User.updateOne(
            { _id: friendId, 'friends.ownId': userId },
            { $set: { 'friends.$.isFriend': 'accepted' } }
        );

        res.redirect('/friend');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

const removeFriend = async (req, res) => {
    const friendId = req.params.id; // Lấy ID người bạn muốn xóa
    const yourId = req.session.user._id; // Lấy ID người dùng hiện tại

    try {
        // Tìm người dùng hiện tại
        const user = await User.findOne({ _id: yourId });

        // Loại bỏ người bạn khỏi mảng friends của người dùng hiện tại
        await User.updateOne(
            { _id: yourId },
            { $pull: { friends: { ownId: friendId } } }
        );

        // Tìm người bạn
        const friend = await User.findOne({ _id: friendId });

        // Loại bỏ người dùng khỏi mảng friends của người bạn
        await User.updateOne(
            { _id: friendId },
            { $pull: { friends: { ownId: yourId } } }
        );

        // Chuyển hướng người dùng về danh sách bạn bè sau khi đã xóa
        res.redirect('/friend');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};



const Setting = async (req, res) => {
   res.render('setting')
};
const SetPassword = async (req, res) => {
    const email = req.body.email
    const oldPassword = req.body.oldpassword
    const newPassword = req.body.newpassword
    const confirm = req.body.confirmpassword
try{
    

    if (newPassword !== confirm) {
        return res.render("setting",{ message: 'Mật khẩu xác nhận không khớp!' });
    }

    // 2. Tìm người dùng theo email
    const user = await User.findOne({ email:email,password:oldPassword });
    if (!user.email) {
        return res.render("setting",{ message: 'Email không tồn tại!' });
    }
    if (!user.password) {
        return res.render("setting",{ message: 'Password không tồn tại!' });
    }

    // 5. Cập nhật mật khẩu
    await User.updateOne({ email }, { $set: { password: newPassword } });

    res.render("setting",{ message: 'Đổi mật khẩu thành công!' });
} catch (error) {
    console.error(error);
    res.render("setting",{ message: 'Đã xảy ra lỗi, vui lòng thử lại sau!' });
}
 };



 const Forgot = async(req,res) => {
    try {
        res.render('forgot')
    } catch (error) {
        console.log(error.message)
    }
}

const ForgotPost = async(req,res) => {
   const email = req.body.email
   const user = await User.findOne({email:email})

   if(!user){
    res.render("forgot",{message:"email không tồn tại"})
   }

   const objectPass = {
    email:email,
    otp:generate.generateRandomNumber(6),
    expireAt:Date.now(),
    
   }

   const forgotPass = new ForgotPass(objectPass)
   await forgotPass.save()

   const subject = "mã Otp xác minh Mật khẩu"
    const html = ` mã otp của bạn là <b>${objectPass.otp}</b> . Thời hạn sử dụng 2p`
    SendMail.sendMail(email,subject,html)

   res.redirect(`otp?email=${email}`)
}

const Otp = async(req,res) => {
    res.render('otp')
}
const OtpPost = async(req,res) => {
    const email = req.body.email
    const otp = req.body.otp

    const result = await ForgotPass.findOne({
        email:email,
        otp:otp,
    })

    if(!result){
        res.render('otp',{message:"OTP không hợp lệ"})
    }

    const userData = await User.findOne({
        email:email,       
    })
    
    if(userData){
        req.session.user = userData
        res.cookie('user',JSON.stringify(userData))
        res.redirect('reset')
    }
}
const Reset = async(req,res) => {
    res.render('reset')
}
const ResetPass = async(req,res) => {
   const newPass = req.body.newpassword
   const confirm = req.body.confirmpassword
    const token = req.session.user._id
    if(newPass !== confirm){
        res.render("otp",{message:"mật khẩu mới không khớp"})
    }
    await User.updateOne({
        _id:token
    },{
        password:newPass
    })

    res.redirect('dashboard')
}
const Game = async (req, res) => {
    res.render('game')
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
    contact,
    contactPost,
    Game,
    Comment,
    Like,
    Friend,
    addFriend,
    acceptFriend,
    removeFriend,
    Setting,
    SetPassword,
    Forgot,
    ForgotPost,
    Otp,
    OtpPost,
    Reset,
    ResetPass,
}