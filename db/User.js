const mongoose = require("mongoose");


const UserSchema=new mongoose.Schema({
    name:String,
    username:String,
    email:String,
    password:String,
    imageName:String
})

module.exports = mongoose.model("users",UserSchema);