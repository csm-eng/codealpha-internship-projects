require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const connectDB = require("./db");
connectDB();

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/post");

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
    res.json({ status: "API is running 🚀", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});