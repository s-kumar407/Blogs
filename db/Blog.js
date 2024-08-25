const mongoose = require("mongoose");


const blogSchema =new mongoose.Schema({
    title:String,
    content:String,
    blogImageName:String,
    userID:String,
    publishDate:String
})


module.exports = mongoose.model("blogs",blogSchema)