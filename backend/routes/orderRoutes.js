const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const User = require("../models/User");
const { auth, admin } = require("../middleware/authMiddleware");

// Create Order
router.post("/", async (req, res) => {

    try {

        const order = new Order(req.body);

        const savedOrder = await order.save();

        res.status(201).json(savedOrder);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// Get Logged-In User's Orders
router.get("/mine", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const orders = await Order.find({ email: user.email }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Orders (Admin only)
router.get("/", auth, admin, async (req, res) => {

    try {

        const orders = await Order.find().sort({ orderDate: -1 });

        res.json(orders);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// Update Order Status (Admin only)
router.put("/:id/status", auth, admin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;