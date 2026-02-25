const express = require("express");
const connectDB = require("./config/dbconn");
const cors = require('cors');
const dotenv = require("dotenv")
const userRouter = require("./router/user.route");
const productRouter = require("./router/product.route");
const orderRouter = require("./router/order.route");
const app = express();

dotenv.config();
app.use(cors());
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use(express.json()); // Middleware to parse JSON data

connectDB();

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Welcome to the backend server" });
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
