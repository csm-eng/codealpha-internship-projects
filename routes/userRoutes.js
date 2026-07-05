const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const Post = require("../models/post");
const auth = require("../middleware/auth");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const colors = ["#8b5cf6", "#6366f1", "#ec4899", "#f59e0b", "#10b981"];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            avatarColor
        });

        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarColor: user.avatarColor,
                followers: user.followers,
                following: user.following
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// FORGOT PASSWORD — request a reset token
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Respond the same way whether or not the account exists,
        // so this endpoint can't be used to check which emails are registered.
        if (!user) {
            return res.json({
                message: "If an account with that email exists, a reset link has been generated."
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // valid for 30 minutes
        await user.save();

        // TODO: In production, email `rawToken` (as a link like
        // https://yourapp.com/reset-password/<rawToken>) to the user via
        // Nodemailer/SendGrid/etc instead of returning it in the response.
        console.log("DEBUG forgot-password:", {
            userId: user._id.toString(),
            rawToken,
            hashedTokenStored: hashedToken,
            expiresAt: user.resetPasswordExpires
        });

        res.json({
            message: "If an account with that email exists, a reset link has been generated.",
            resetToken: rawToken // TEMP: remove once real email sending is wired up
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// RESET PASSWORD — consume the token
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        // TEMP DEBUG — remove after diagnosing
        const userByTokenOnly = await User.findOne({ resetPasswordToken: hashedToken });
        console.log("DEBUG reset-password:", {
            receivedToken: req.params.token,
            computedHash: hashedToken,
            foundByTokenOnly: !!userByTokenOnly,
            storedExpiry: userByTokenOnly?.resetPasswordExpires,
            storedExpiryType: userByTokenOnly?.resetPasswordExpires?.constructor?.name,
            nowIsBefore: userByTokenOnly ? new Date() < userByTokenOnly.resetPasswordExpires : null
        });

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Reset link is invalid or has expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: "Password has been reset successfully. You can now log in." });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET ALL USERS
router.get("/", async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
});

// UPDATE MY BIO
router.put("/me/bio", auth, async (req, res) => {
    try {
        const { bio } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { bio: bio || "" },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Bio updated successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// FOLLOW A USER
router.post("/:id/follow", auth, async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user.id;

        if (targetId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyFollowing = targetUser.followers.some(
            f => f.toString() === currentUserId
        );

        if (alreadyFollowing) {
            return res.status(400).json({ message: "Already following this user" });
        }

        targetUser.followers.push(currentUserId);
        currentUser.following.push(targetId);

        await targetUser.save();
        await currentUser.save();

        res.json({ message: "Followed successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// UNFOLLOW A USER
router.delete("/:id/follow", auth, async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user.id;

        const targetUser = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        targetUser.followers = targetUser.followers.filter(
            f => f.toString() !== currentUserId
        );
        currentUser.following = currentUser.following.filter(
            f => f.toString() !== targetId
        );

        await targetUser.save();
        await currentUser.save();

        res.json({ message: "Unfollowed successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET A USER'S PROFILE + POSTS
// NOTE: kept below /me/bio and /:id/follow so those more specific
// routes are matched first
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("followers", "name avatarColor")
            .populate("following", "name avatarColor");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = await Post.find({ userId: req.params.id })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json({ user, posts });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;