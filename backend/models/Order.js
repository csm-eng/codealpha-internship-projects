const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    customerName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    products: [
        {
            productId: String,
            quantity: Number
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "Processing"
    },

    orderDate: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Order", orderSchema);