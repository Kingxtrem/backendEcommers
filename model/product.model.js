const mongoose = require("mongoose")

const productSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    rating:{
        type:Number,
        default:0
    },
    category:{
        type:String,
        required:true
    },
    inStock:{
        type:Number,
        default:1
    },
    image:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const Product= mongoose.model("Product",productSchema)

module.exports=Product