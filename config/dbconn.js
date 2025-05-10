const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()


const connectDB = async () => {
    let dbUrl = "mongodb+srv://tantubaykingshuk:9MJE7RO9IVQKKkgx@cluster0.2liq5fj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    try {
        await mongoose.connect(dbUrl);
        console.log("mongodb connected succefully")
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1)
    }
}

module.exports = connectDB;