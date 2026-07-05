import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../api";
import PostCard from "./PostCard";

function UserProfile({ userId, currentUser, onProfileClick }) {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const isOwnProfile = currentUser?._id === userId;

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await API.get(`/users/${userId}`);
            setProfile(res.data.user);
            setPosts(res.data.posts);

            // Check if current user follows this profile
            const alreadyFollowing = res.data.user.followers?.some(
                f => (f._id || f) === currentUser?._id
            );
            setIsFollowing(alreadyFollowing);
        } catch (err) {
            console.error("Profile fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await API.delete(`/users/${userId}/follow`);
                setIsFollowing(false);
                setProfile(prev => ({
                    ...prev,
                    followers: prev.followers.filter(f => (f._id || f) !== currentUser._id)
                }));
            } else {
                await API.post(`/users/${userId}/follow`);
                setIsFollowing(true);
                setProfile(prev => ({
                    ...prev,
                    followers: [...prev.followers, { _id: currentUser._id, name: currentUser.name }]
                }));
            }
        } catch (err) {
            console.error("Follow error:", err);
            alert(err.response?.data?.message || "Failed to update follow status");
        } finally {
            setFollowLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="loading-spinner" />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="empty-feed">
                    <span className="empty-icon">👤</span>
                    <h3>User not found</h3>
                </div>
            </div>
        );
    }

    const initials = profile.name
        ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "U";

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
                        style={{ background: profile.avatarColor || "var(--btn-gradient)" }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.1 }}
                    >
                        {initials}
                    </motion.div>
                </div>

                <div className="profile-info">
                    <div className="profile-name-row">
                        <h2 className="profile-name">{profile.name}</h2>
                        {!isOwnProfile && (
                            <motion.button
                                className={`follow-btn ${isFollowing ? "following" : ""}`}
                                onClick={handleFollow}
                                disabled={followLoading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {followLoading ? "..." : isFollowing ? "✓ Following" : "+ Follow"}
                            </motion.button>
                        )}
                    </div>

                    {profile.bio && (
                        <p className="profile-bio">{profile.bio}</p>
                    )}

                    {/* Stats Row */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-count">{posts.length}</span>
                            <span className="stat-label">Posts</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-count">{profile.followers?.length || 0}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-count">{profile.following?.length || 0}</span>
                            <span className="stat-label">Following</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className="profile-posts-section">
                <h3 className="profile-posts-title">{profile.name}'s Posts</h3>
                {posts.length === 0 ? (
                    <div className="empty-feed">
                        <span className="empty-icon">📭</span>
                        <h3>No posts yet</h3>
                        <p>This user hasn't posted anything yet.</p>
                    </div>
                ) : (
                    <motion.div
                        className="feed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUser={currentUser}
                                refreshPosts={fetchProfile}
                                onProfileClick={onProfileClick}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default UserProfile;
