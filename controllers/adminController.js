const Account = require("../models/admin/adminModel")
const Role = require("../models/admin/roleModel")
const User = require("../models/userModel")
const Post = require("../models/postModel")
const Group = require("../models/groupModel")
const Contact = require("../models/contactModel")
const submitContact = require("../models/admin/submitContact")
const md5 = require('md5');
const moment = require('moment')
module.exports.dashboard = async (req, res) => {
  const users = await User.find({
    deleted:false
  })
   res.render("admin/pages/dashboard/index.pug", {
      pageTitle: "trang tổng quan",
      users:users
   })
}

module.exports.indexAccount = async (req, res) => {
   let find = {
       deleted: false
   };

   const records = await Account.find(find).select("-password -token")

   for (const record of records){
      const role = await Role.findOne({
        deleted: false,
        _id: record.role_id
      })
      record.role = role.title
    }
    const users = await User.find({})
    
   
   res.render("admin/pages/accounts/index", {
       pageTitle: "Danh sách tài khoản",
       records: records,
       users:users
   });
}

module.exports.createAccount = async (req, res) => {
   const roles = await Role.find({
      deleted: false
    })
   res.render("admin/pages/accounts/create", {
       pageTitle: "Tạo tài khoản mới",
       roles: roles
   });
}


// [POST] /admin/accounts/create
module.exports.createPostAccount = async (req, res) => {
   const emailExist = await Account.findOne({
       email: req.body.email,
       deleted: false
   })

   if(emailExist) {
       req.flash("error", `Email ${req.body.email} đã tồn tại`)
       res.redirect("back")
   }
   else {
      req.body.password = md5(req.body.password)
   
   const record = new Account(req.body)
   await record.save();

   res.redirect(`/ad/accounts`);
   }
   

 }

 module.exports.indexRole = async (req, res) => {

   let find = {
     deleted: false
   }
    const records = await Role.find(find);
     res.render("admin/pages/roles/index.pug", {
        pageTitle: "Nhóm quyền",
        records: records
     })
   }
   
   module.exports.createRole = async (req, res) => {

      res.render("admin/pages/roles/create", {
         pageTitle: "Tạo nhóm quyền",
       
      })
    }
    
    //[post]  /admin/roles/create
    module.exports.createPostRole = async (req, res) => {
    
    const record = new Role(req.body)
    await record.save();
    res.redirect(`/ad/roles`)
    }

    module.exports.permissions = async (req, res) => {
      let find = {
        deleted: false
      }
      const records = await Role.find(find);
      res.render("admin/pages/roles/permissions", {
        pageTitle: "Phân quyền",
        records : records
      })
      }

      module.exports.login = (req, res) => {
         if(req.cookies.token){
           res.redirect(`/ad/dashboard`)
         }
         else {
       res.render("admin/pages/auth/login.pug", {
            pageTitle: "Trang đăng nhập"
         })
         }
       }

      module.exports.loginPost = async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        const user = await Account.findOne({
        email: email,
        deleted: false
        })
      if (!user) {
        req.flash("error", `Email ${email} không tồn tại`)
        res.redirect("back");
        return;
      }
      if (md5(password) != user.password){
        req.flash("error", "Sai mật khẩu!");
        res.redirect("back")
        return;
      }
      
      if (user.status == "inactive"){
        req.flash("error", "tài khoản của bạn đã bị khóa");
        res.redirect("back")
        return;
      }

      res.cookie("token", user.token);
        res.redirect(`/ad/dashboard`)
      }

      module.exports.logout = (req, res) => {
        res.clearCookie("token");
       res.redirect(`/ad/login`);
      }


      module.exports.permissionsPatch= async (req, res) => { 
        const permissions = JSON.parse(req.body.permissions)
    
        for (const item of permissions) {
            await Role.updateOne({_id: item.id},{permissions:item.permissions})
        }
        req.flash("success","cap nhat thanh cong")
    
        res.redirect("back")
    }
      



    module.exports.Post = async (req, res) => {
      const users = await User.find({
        deleted:false
      })
      const posts = await Post.find({}).sort({DateAt:-1}).limit(3)
      
       res.render("admin/pages/posts/index.pug", {
          pageTitle: "trang tổng quan",
          users:users,
          posts:posts
       })
    }

    module.exports.Chart = async (req, res) => {
      const users = await User.find({
        deleted:false,
      })

      
       res.render("admin/pages/charts/chart.pug", {
          pageTitle: "Chart",
          users:users
       })
    }


    module.exports.Note = async (req, res) => {
      const users = await User.find({
        deleted:false,
      })
      const posts = await Post.find({}).sort({DateAt:-1}).limit(6)
      const groups = await Group.find({}).sort({createdAt:-1}).limit(6)
      
      const contacts = await Contact.find({}).sort({createdAt:-1}).limit(3)
     
       res.render("admin/pages/notifications/index.pug", {
          pageTitle: "Notification",
          users:users,
          posts:posts,
          groups:groups,
          contacts:contacts
       })
    }

    module.exports.Map = async (req, res) => {
      const users = await User.find({
        deleted:false,
      })
      const posts = await Post.find({}).sort({DateAt:-1}).limit(6)
      const groups = await Group.find({}).sort({createdAt:-1}).limit(6)
      
      
     
       res.render("admin/pages/map/index.pug", {
          pageTitle: "Maps",
          users:users,
          posts:posts,
          groups:groups
       })
    }


    module.exports.Contact = async (req, res) => {
      const users = await User.find({
        deleted:false,
      })
      const contacts = await Contact.find({}).sort({DateAt:-1})
      const submits = await submitContact.find({})
  
    
      // Log the contacts and submits for debugging
    console.log("Contacts:", contacts);
    console.log("Submits:", submits);

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

      return {
          ...contact.toObject(), // Convert Mongoose document to plain object
          hasSubmit, // Add a flag to indicate if there's a matching submit
          adminName, // Add adminName to the contact object
          messages // Add message to the contact object
      };
  });

    console.log("Contacts with submits:", contactsWithSubmits);
       res.render("admin/pages/contacts/index.pug", {
          pageTitle: "Contact",
          users:users,
          contacts: contacts,
          submits:submits,
          contactsWithSubmits:contactsWithSubmits
       })
    }

    module.exports.submitContact = async (req, res) => {
      const accounts = await Account.find({deleted:false})
      const token = req.cookies.token;
      
      var obj;
      for (const account of accounts) {
        if(account.token == token){
          obj = account.fullName
        }
      }
      
      const reply = new submitContact({
        userMessageDate:req.body.date,
        message:req.body.message,
        adminName:obj,
        DateAt:new Date()
      })
      await reply.save()

      res.redirect('/ad/contact')
    };
    
    module.exports.accountChange = async (req,res) => {

      const userId = req.params.id
      await User.updateOne({ _id: userId }, { deleted: true });
        
      res.redirect('/ad/accounts')
    }


    module.exports.accountChange2 = async (req,res) => {

      const userId = req.params.id
      await User.updateOne({ _id: userId }, { deleted: false });
        
      res.redirect('/ad/accounts')
    }

module.exports.api = async (req,res) => {
  const accounts = await Account.find({})
  
  res.json(accounts)
}
   
       
 
