const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true }, // Nội dung comment
    userName: { type: String, required: true }, // Tên người dùng bình luận
    userId: { type: String, required: true }, // ID người dùng bình luận
    DateAt: { type: Date, default: Date.now } // Thời gian bình luận
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    userName:String,
    user_id_upload:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    popular:String,
    DateAt: { type: Date, default: Date.now },
    comments: { type: [commentSchema], default: [] },
    likes: { type: Number, default: 0 }
},
    {timestamps:true}
)

module.exports = mongoose.model('Post',postSchema)