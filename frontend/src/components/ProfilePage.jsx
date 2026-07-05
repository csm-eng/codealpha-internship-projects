import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import PostCard from "./PostCard";

function ProfilePage({ user, onUserUpdate, onProfileClick }) {
    const [profile, setProfile] = useState(user);
    const [posts, setPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(user?.bio || "");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    const initials = profile?.name
        ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    useEffect(() => {
        fetchProfile();
    }, [user._id]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await API.get(`/users/${user._id}`);
            setProfile(res.data.user);
            setPosts(res.data.posts);
            setBio(res.data.user.bio || "");
        } catch (err) {
            console.error("Profile fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const saveBio = async () => {
        setIsSaving(true);
        try {
            const res = await API.put("/users/me/bio", { bio });
            const updatedUser = { ...user, bio: res.data.user.bio };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            if (onUserUpdate) onUserUpdate(updatedUser);
            setProfile(res.data.user);
            setIsEditing(false);
        } catch (err) {
            console.error("Bio save error:", err);
            alert("Failed to update bio");
        } finally {
            setIsSaving(false);
        }
    };

    const refreshPosts = async () => {
        try {
            const res = await API.get(`/users/${user._id}`);
            setPosts(res.data.posts);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div
            className="profile-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Profile Header Card */}
            <div className="profile-card">
                <div className="profile-cover" />

                <div className="profile-avatar-wrap">
                    <motion.div
                        className="profile-avatar"
                        style={{ background: profile?.avatarColor || "var(--btn-gradient)" }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.1 }}
                    >
                        {initials}
                    </motion.div>
                </div>

                <div className="profile-info">
                    <h2 className="profile-name">{profile?.name}</h2>
                    <p className="profile-email">{profile?.email}</p>

                    {/* Bio section */}
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="edit"
                                className="bio-edit"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                            >
                                <textarea
                                    className="bio-textarea"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Write something about yourself..."
                                    maxLength={300}
                                    autoFocus
                                />
                                <div className="bio-edit-actions">
                                    <span className="bio-char-count">{bio.length}/300</span>
                                    <button
                                        className="bio-cancel-btn"
                                        onClick={() => { setIsEditing(false); setBio(profile?.bio || ""); }}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        className="bio-save-btn"
                                        onClick={saveBio}
                                        disabled={isSaving}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        {isSaving ? "Saving..." : "Save"}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view"
                                className="bio-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="profile-bio">
                                    {profile?.bio || <span className="bio-placeholder">No bio yet.</span>}
                                </p>
                                <button className="edit-bio-btn" onClick={() => setIsEditing(true)}>
                                    ✏️ {profile?.bio ? "Edit bio" : "Add bio"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats Row */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-count">{posts.length}</span>
                            <span className="stat-label">Posts</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-count">{profile?.followers?.length || 0}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-count">{profile?.following?.length || 0}</span>
                            <span className="stat-label">Following</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className="profile-posts-section">
                <h3 className="profile-posts-title">Your Posts</h3>
                {isLoading ? (
                    <div className="profile-loading">Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div className="empty-feed">
                        <span className="empty-icon">📝</span>
                        <h3>No posts yet</h3>
                        <p>Share something from the home feed!</p>
                    </div>
                ) : (
                    <motion.div
                        className="feed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.07 }}
                    >
                        {posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUser={user}
                                refreshPosts={refreshPosts}
                                onProfileClick={onProfileClick}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default ProfilePage;
