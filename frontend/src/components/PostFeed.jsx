import { motion, AnimatePresence } from "framer-motion";
import PostCard from "./PostCard";

function PostFeed({ posts, refreshPosts, currentUser, onProfileClick }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="feed">
                <motion.div
                    className="empty-feed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3>No posts yet</h3>
                    <p>Be the first to post something 🚀</p>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div className="feed">
            <AnimatePresence>
                {posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        currentUser={currentUser}
                        refreshPosts={refreshPosts}
                        onProfileClick={onProfileClick}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}

export default PostFeed;