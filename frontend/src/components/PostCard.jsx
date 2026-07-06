import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import { getVideoEmbedUrl } from "../utils/mediaUtils";

function PostCard({ post, currentUser, refreshPosts, onProfileClick }) {

    const initialLikes = useMemo(() => {
        if (!post._id) return 5;
        const num = parseInt(post._id.slice(-4), 16);
        return isNaN(num) ? 5 : (num % 25) + 3;
    }, [post._id]);

    const [likesCount, setLikesCount] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);

    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");

    const [comments, setComments] = useState([
        {
            id: 1,
            author: "Jane",
            text: "Amazing 🔥"
        }
    ]);

    const [isDeleting, setIsDeleting] = useState(false);

    // -------------------------
    // Owner Detection
    // -------------------------

    const currentUserId = currentUser?._id?.toString();

    let postOwnerId = "";

    if (typeof post.userId === "object") {
        postOwnerId = post.userId?._id?.toString();
    } else {
        postOwnerId = post.userId?.toString();
    }

    const isOwner = currentUserId === postOwnerId;

    // -------------------------
    // Like
    // -------------------------

    const toggleLike = () => {
        if (isLiked) {
            setLikesCount(prev => prev - 1);
        } else {
            setLikesCount(prev => prev + 1);
        }

        setIsLiked(!isLiked);
    };

    // -------------------------
    // Comment
    // -------------------------

    const submitComment = (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        setComments([
            ...comments,
            {
                id: Date.now(),
                author: currentUser?.name || "You",
                text: newComment
            }
        ]);

        setNewComment("");
    };

    // -------------------------
    // Delete
    // -------------------------

    const deletePost = async () => {

        if (!window.confirm("Delete this post?"))
            return;

        try {

            setIsDeleting(true);

            await API.delete(`/posts/${post._id}`);

            alert("Post deleted successfully");

            refreshPosts();

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data?.message ||
                "Unable to delete post."
            );

        } finally {

            setIsDeleting(false);

        }

    };

    const authorName =
        typeof post.userId === "object"
            ? post.userId.name
            : "Unknown";

    const authorId =
        typeof post.userId === "object"
            ? post.userId._id
            : post.userId;

    const initials =
        authorName
            ?.split(" ")
            .map(x => x[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

    return (

        <motion.div
            className="card"
            layout
        >

            <div className="card-header">

                <div
                    className="avatar"
                    style={{ cursor: "pointer" }}
                    onClick={() => onProfileClick(authorId)}
                >
                    {initials}
                </div>

                <div className="user-meta">

                    <h3
                        style={{ cursor: "pointer" }}
                        onClick={() => onProfileClick(authorId)}
                    >
                        {authorName}
                    </h3>

                    <span>

                        {new Date(post.createdAt).toLocaleString()}

                    </span>

                </div>

                {isOwner && (

                    <button
                        className="delete-post-btn"
                        onClick={deletePost}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "🗑"}
                    </button>

                )}

            </div>

            <p>{post.content}</p>

            {/* MEDIA */}

            {post.mediaUrl !== "" && (

                <div className="card-media-wrapper">

                    {post.mediaType === "image" ? (

                        <img
                            src={post.mediaUrl}
                            className="card-media"
                            alt=""
                        />

                    ) : getVideoEmbedUrl(post.mediaUrl) ? (

                        <iframe
                            src={getVideoEmbedUrl(post.mediaUrl)}
                            className="card-media"
                            style={{ aspectRatio: "16 / 9", width: "100%", border: "none" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />

                    ) : (

                        <video
                            controls
                            className="card-media"
                        >
                            <source
                                src={post.mediaUrl}
                            />
                        </video>

                    )}

                </div>

            )}



            <div className="actions">

                <button
                    className="action-btn"
                    onClick={toggleLike}
                >

                    ❤️ {likesCount}

                </button>

                <button
                    className="action-btn"
                    onClick={() =>
                        setShowComments(!showComments)
                    }
                >

                    💬 {comments.length}

                </button>

            </div>

            <AnimatePresence>

                {showComments && (

                    <motion.div
                        className="comments-section"
                    >

                        {comments.map(comment => (

                            <div
                                key={comment.id}
                                className="comment-item"
                            >

                                <b>{comment.author}</b>

                                <br />

                                {comment.text}

                            </div>

                        ))}

                        <form className="comment-form" onSubmit={submitComment}>

                            <input
                                type="text"
                                placeholder="Write comment..."
                                value={newComment}
                                onChange={(e) =>
                                    setNewComment(e.target.value)
                                }
                            />

                            <button>

                                Send

                            </button>

                        </form>

                    </motion.div>

                )}

            </AnimatePresence>

        </motion.div>

    );

}

export default PostCard;