// routes/stats.js (tạo file mới hoặc thêm vào file router hiện tại)
const express = require('express');
const router = express.Router();
const User = require('../models/userModel'); // Đảm bảo đúng đường dẫn tới model
const Chat = require('../models/chatModel'); // Đảm bảo đúng đường dẫn tới model
const Post = require('../models/postModel'); // Đảm bảo đúng đường dẫn tới model


const fillMissingDays = (data) => {
    const filledData = new Array(7).fill(0); // Create an array with 7 zeroes (for each day)
    data.forEach(item => {
        filledData[item._id - 1] = item.count; // Day of the week is 1-7, adjust the index
    });
    return filledData;
};

// Lấy dữ liệu thống kê từ database
router.get('/data', async (req, res) => {
    try {
        const accountsPerDay = await User.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
       
        const chatsPerDay = await Chat.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" }, // Giả sử bạn có field `updatedAt` đại diện cho chat
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
       
        const postsPerDay = await Post.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" }, // Giả sử bạn có một bảng khác để lưu posts
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const filledAccountsPerDay = fillMissingDays(accountsPerDay);
        const filledChatsPerDay = fillMissingDays(chatsPerDay);
        const filledPostsPerDay = fillMissingDays(postsPerDay);

        res.json({
            accountsPerDay: filledAccountsPerDay,
            chatsPerDay: filledChatsPerDay,
            postsPerDay: filledPostsPerDay
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
