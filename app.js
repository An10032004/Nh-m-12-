require('dotenv').config()

var mongoose = require('mongoose')


mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app')
// mongodb+srv://sa:sa123@cluster0.t2afm.mongodb.net/dynamic-chat-app

const app = require('express')()

const http = require('http').Server(app)
const moment = require('moment')

app.locals.moment = moment
const User = require('./models/userModel')
const Chat = require('./models/chatModel')

const userRoute = require("./routes/userRoute")
app.use('/',userRoute)
const adminRoute = require("./routes/adminRoute")
app.use('/',adminRoute)
const io = require('socket.io')(http)
 
var usp = io.of('/user-namespace')

usp.on('connection',async function(socket){
    console.log('user connected')

    const userId = socket.handshake.auth.token

    await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'1'}})

    socket.broadcast.emit('getOnlineUser',{user_id:userId})

    socket.on('disconnect',async function(){
        console.log('user disconnected')

        const userId = socket.handshake.auth.token

        await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}})


        socket.broadcast.emit('getOfflineUser',{user_id:userId})

    })
    socket.on('newChat',function(data){
        socket.broadcast.emit('loadNewChat',data) 
    })


    socket.on('existsChat',async function(data){
        var chats = await Chat.find({ $or:[
            {sender_id:data.sender_id,receiver_id:data.receiver_id},
            {sender_id:data.receiver_id,receiver_id:data.sender_id}
        ]})


        socket.emit('loadChats',{ chats:chats})
    })
    socket.on('chatDeleted',function(id){
        socket.broadcast.emit('chatMessageDeleted',id)
    })

    socket.on('chatUpdated',function(data){
        socket.broadcast.emit('chatMessageUpdated',data)
    })

})

http.listen(3001,function(){
    console.log('server is running')
})