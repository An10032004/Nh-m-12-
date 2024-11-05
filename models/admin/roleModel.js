const mongoose = require("mongoose");
const roleSchema = new mongoose.Schema({
    
title: String,
description: String,
permissions: {
  type: Array,
  default: []
}, 
deleted: {
  type: Boolean,
  default: false
},
deletedAt: Date
}, {
  timestamps: true
});

const Role = mongoose.model("Role", roleSchema); //Role là tên của model này, roleSchema là tên của định dạng,  roles là tên trong mongodb

module.exports = Role;  // chỉ export cái thằng Role 