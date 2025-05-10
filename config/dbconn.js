const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()


const connectDB = async () => {
    let dbUrl = process.env.MONGO_URL
    try {
        await mongoose.connect(dbUrl);
        console.log("mongodb connected succefully")
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1)
    }
}

module.exports = connectDB;