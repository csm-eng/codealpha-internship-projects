import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import API from "./api";

import PostForm from "./components/PostForm";
import PostFeed from "./components/PostFeed";

import SplashScreen from "./components/SplashScreen";
import AuthPage from "./components/AuthPage";
import ProfilePage from "./components/ProfilePage";
import UserProfile from "./components/UserProfile";

import "./styles.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [isSplashActive, setIsSplashActive] = useState(true);

  const [currentView, setCurrentView] = useState("feed");
  const [viewingUserId, setViewingUserId] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sorted);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const timer = setTimeout(() => setIsSplashActive(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCurrentView("feed");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleProfileClick = (userId) => {
    if (userId === user?._id) {
      setCurrentView("profile");
    } else {
      setViewingUserId(userId);
      setCurrentView("userProfile");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {isSplashActive ? (
          <motion.div key="splash">
            <SplashScreen />
          </motion.div>
        ) : !user ? (
          <motion.div key="auth">
            <AuthPage onAuthSuccess={(u) => setUser(u)} />
          </motion.div>
        ) : (
          <motion.div key="main" className="main-layout">
            <header className="navbar">
              <div className="navbar-left">
                <h1
                  className="logo"
                  onClick={() => setCurrentView("feed")}
                >
                  📸 SocialMedia
                </h1>

                <button
                  className="nav-btn"
                  onClick={() => setCurrentView("feed")}
                >
                  🏠 Home
                </button>

                <button
                  className="nav-btn"
                  onClick={() => setCurrentView("profile")}
                >
                  👤 Profile
                </button>
              </div>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </header>

            {currentView === "feed" && (
              <div>
                <PostForm user={user} refreshPosts={fetchPosts} />
                <PostFeed
                  posts={posts}
                  currentUser={user}
                  refreshPosts={fetchPosts}
                  onProfileClick={handleProfileClick}
                />
              </div>
            )}

            {currentView === "profile" && (
              <ProfilePage
                user={user}
                onUserUpdate={handleUserUpdate}
                onProfileClick={handleProfileClick}
              />
            )}

            {currentView === "userProfile" && viewingUserId && (
              <UserProfile
                userId={viewingUserId}
                currentUser={user}
                onProfileClick={handleProfileClick}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;