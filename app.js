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

const statsRouter = require('./routes/statsRoutes');
app.use('/stats', statsRouter);

const io = require('socket.io')(http)
 
var usp = io.of('/user-namespace')
//tic

//toc
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
    //group
    socket.on('newGroupChat',function(data){
        socket.broadcast.emit('loadNewGroupChat',data)
    })
    socket.on('groupChatDeleted',function(id){
        socket.broadcast.emit('groupChatMessageDeleted',id)

    })

    //friend
    

    //games
    
    let currentCode = null;

        socket.on('move', function(move) {
            console.log('move detected')

            usp.to(currentCode).emit('newMove', move);
        });
        
        socket.on('joinGame', function(data) {

            currentCode = data.code;
            socket.join(currentCode);
            if (!games[currentCode]) {
                games[currentCode] = true;
               return
            }
            
                usp.to(currentCode).emit('startGame');
            
        });

        socket.on('disconnect', function() {

            if (currentCode) {
                usp.to(currentCode).emit('gameOverDisconnect');
                delete games[currentCode];
            }
        });
        socket.on("CLIENT_SEND_TYPING", async (type) =>{
            const user = await User.findOne({_id:socket.handshake.auth.token})
            
            socket.broadcast.emit('SERVER_RETURN_TYPING',{
                userId:user._id,
                fullName:user.name,
                type:type,
            })
        })
       
       
})


http.listen(3001,function(){
    console.log('server is running')
})