const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        mediaUrl: {
            type: String,
            default: ""
        },
        mediaType: {
            type: String,
            enum: ["image", "video", "none"],
            default: "none"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);