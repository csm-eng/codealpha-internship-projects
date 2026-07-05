const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        bio: {
            type: String,
            default: "",
            maxlength: 300
        },
        avatarColor: {
            type: String,
            default: "#8b5cf6"
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);