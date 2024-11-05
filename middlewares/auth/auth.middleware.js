const Account = require("../../models/admin/adminModel.js")
const Role = require("../../models/admin/roleModel.js")

module.exports.requireAuth = async (req, res, next) => {
  
  if (!req.cookies.token) {
  res.redirect(`/ad/login`)
  } else {// lấy cookies từ link req
  const user = await Account.findOne({token: req.cookies.token}).select("-password");
  if (!user) {
    res.redirect(`/ad/login`)
  }
  else {
   const role = await Role.findOne({
    _id: user.role_id
   }).select("title permissions")
   res.locals.role = role;
    res.locals.user = user;
   next();
  }
   
  }
}