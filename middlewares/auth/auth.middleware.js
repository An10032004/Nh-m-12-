const Account = require("../../models/admin/adminModel.js")
const Role = require("../../models/admin/roleModel.js")
const Post = require("../../models/postModel.js")
const Group = require("../../models/groupModel.js")
const User = require("../../models/userModel.js")

module.exports.requireAuth = async (req, res, next) => {
  
  if (!req.cookies.token) {
  res.redirect(`/ad/login`)
  } else {// lấy cookies từ link req
  const user = await Account.findOne({token: req.cookies.token}).select("-password");
  const posts = await Post.find({}).sort({createdAt:-1}).limit(3)
  const groups = await Group.find({}).sort({createdAt:-1}).limit(3)


  const totalUsersAndGroups = posts.length + groups.length;
  const users = await User.find({})
  if (!user) {
    res.redirect(`/ad/login`)
  }
  else {
   const role = await Role.findOne({
    _id: user.role_id
   }).select("title permissions")
   res.locals.role = role;
    res.locals.user = user;
    res.locals.posts = posts
    res.locals.groups = groups
    res.locals.users = users
    res.locals.total = totalUsersAndGroups
   next();
  }
   
  }
}