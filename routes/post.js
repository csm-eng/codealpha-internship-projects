const express = require("express");
const router = express.Router();

const Post = require("../models/post");

// CREATE POST
router.post("/create", async (req, res) => {
    try {
        const { userId, content, mediaUrl, mediaType } = req.body;

        if (!userId || (!content?.trim() && !mediaUrl)) {
            return res.status(400).json({ message: "Post must include text or media" });
        }

        const newPost = new Post({
            userId,
            content: content?.trim() || "",
            mediaUrl,
            mediaType
        });

        await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().populate("userId", "name email");
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
});

// DELETE POST
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({ message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;