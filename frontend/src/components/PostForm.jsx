import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";

function PostForm({ user, refreshPosts }) {
    const [content, setContent] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState("none");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showUrlInput, setShowUrlInput] = useState(false);
    const [tempUrl, setTempUrl] = useState("");
    const [tempType, setTempType] = useState("image");

    const fileRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaUrl(reader.result);
            setMediaType(file.type.startsWith("video") ? "video" : "image");
        };
        reader.readAsDataURL(file);
    };

    const addUrl = () => {
        if (!tempUrl.trim()) return;
        setMediaUrl(tempUrl);
        setMediaType(tempType);
        setShowUrlInput(false);
        setTempUrl("");
    };

    const clearMedia = () => {
        setMediaUrl("");
        setMediaType("none");
    };

    const submitPost = async (e) => {
        e.preventDefault();
        if (!content.trim() && mediaType === "none") return;

        setIsSubmitting(true);

        try {
            await API.post("/posts/create", {
                userId: user._id,
                content,
                mediaUrl: mediaType !== "none" ? mediaUrl : "",
                mediaType
            });

            setContent("");
            clearMedia();
            refreshPosts?.();
        } catch (err) {
            console.log(err);
        }

        setIsSubmitting(false);
    };

    return (
        <motion.div className="postBox">
            <form onSubmit={submitPost}>
                <div className="post-input-container">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user?.name}?`}
                    />
                </div>

                {mediaUrl && (
                    <div className="media-preview-container">
                        {mediaType === "image" ? (
                            <img src={mediaUrl} alt="preview" className="media-preview" />
                        ) : (
                            <video src={mediaUrl} controls className="media-preview" />
                        )}
                        <button type="button" className="close-preview-btn" onClick={clearMedia}>
                            ✕
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {showUrlInput && (
                        <motion.div className="url-input-drawer">
                            <div className="url-form">
                                <input
                                    type="text"
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="Paste URL"
                                />

                                <select
                                    value={tempType}
                                    onChange={(e) => setTempType(e.target.value)}
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>

                                <button type="button" onClick={addUrl}>
                                    Add
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="post-form-options">
                    <div className="attachment-actions">
                        <button type="button" className="attach-btn" onClick={() => fileRef.current.click()}>
                            📎 Upload
                        </button>

                        <button type="button" className="attach-btn" onClick={() => setShowUrlInput((s) => !s)}>
                            🔗 URL
                        </button>

                        <input
                            type="file"
                            ref={fileRef}
                            hidden
                            onChange={handleFile}
                        />
                    </div>

                    <button className="post-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Posting..." : "Post"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

export default PostForm;