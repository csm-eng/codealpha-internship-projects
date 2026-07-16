const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const { auth, admin } = require("../middleware/authMiddleware");


// GET ALL PRODUCTS
router.get("/", async (req, res) => {

    try {

        const products = await Product.find();

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.json(product);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ADD PRODUCT
router.post("/", auth, admin, async (req, res) => {

    try {

        const product = new Product(req.body);

        const savedProduct = await product.save();

        res.status(201).json(savedProduct);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// UPDATE PRODUCT
router.put("/:id", auth, admin, async (req, res) => {

    try {

        const updatedProduct = await Product.findByIdAndUpdate(

            req.params.id,

            req.body,

            { new: true }

        );

        res.json(updatedProduct);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// DELETE PRODUCT
router.delete("/:id", auth, admin, async (req, res) => {

    try {

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            message: "Product Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


module.exports = router;