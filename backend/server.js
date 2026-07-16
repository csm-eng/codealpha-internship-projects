const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const seedDatabase = require("./config/seeder");


const app = express();


// Middleware

app.use(cors());

app.use(express.json());


// MongoDB Connection

mongoose.connect(process.env.MONGO_URI)

    .then(() => {

        console.log("MongoDB Connected");
        seedDatabase();

    })

    .catch((error) => {

        console.log("MongoDB Connection Error:", error);

    });



// API Routes

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/auth", authRoutes);


// Test Route

app.get("/", (req, res) => {

    res.send("E-Commerce Backend Running");

});


// Server Start

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});