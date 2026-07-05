import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";

function AuthPage({ onAuthSuccess }) {
    const [view, setView] = useState("auth"); // "auth" | "forgotRequest" | "forgotReset"

    const [isRegister, setIsRegister] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Forgot / reset password state
    const [forgotEmail, setForgotEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [info, setInfo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            return;
        }

        if (isRegister && !name.trim()) {
            setError("Name is required for registration");
            return;
        }

        setIsLoading(true);

        try {
            if (isRegister) {
                // Register
                await API.post("/users/register", {
                    name: name.trim(),
                    email: email.trim(),
                    password: password.trim()
                });

                // Automatically log in after registration
                const loginRes = await API.post("/users/login", {
                    email: email.trim(),
                    password: password.trim()
                });

                localStorage.setItem("token", loginRes.data.token);
                localStorage.setItem("user", JSON.stringify(loginRes.data.user));
                onAuthSuccess(loginRes.data.user);
            } else {
                // Login
                const res = await API.post("/users/login", {
                    email: email.trim(),
                    password: password.trim()
                });

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                onAuthSuccess(res.data.user);
            }
        } catch (err) {
            console.error("FULL ERROR:", err);

            if (err.response) {
                console.log("Backend Error:", err.response.data);
                setError(
                    err.response.data.error ||
                    err.response.data.message ||
                    "Server error"
                );
            } else {
                setError("Cannot connect to backend.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError("");
        setEmail("");
        setPassword("");
        setName("");
    };

    const goToForgotPassword = () => {
        setView("forgotRequest");
        setError("");
        setInfo("");
        setForgotEmail(email);
    };

    const backToLogin = () => {
        setView("auth");
        setIsRegister(false);
        setError("");
        setInfo("");
        setForgotEmail("");
        setResetToken("");
        setNewPassword("");
        setConfirmNewPassword("");
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (!forgotEmail.trim()) {
            setError("Please enter your email");
            return;
        }

        setIsLoading(true);
        try {
            const res = await API.post("/users/forgot-password", {
                email: forgotEmail.trim()
            });

            setInfo(res.data.message);

            // TEMP: since this project doesn't send real emails yet, the
            // backend hands back the reset token directly so you can test
            // the flow end-to-end. Once email sending is wired up, remove
            // this and instead have the user click the link from their inbox.
            if (res.data.resetToken) {
                setResetToken(res.data.resetToken);
            }

            setView("forgotReset");
        } catch (err) {
            setError(
                err.response?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (!resetToken.trim()) {
            setError("Reset token is required");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            // TEMP DEBUG — remove after diagnosing
            console.log("Submitting reset with token:", JSON.stringify(resetToken.trim()));

            const res = await API.post(`/users/reset-password/${resetToken.trim()}`, {
                password: newPassword
            });

            setInfo(res.data.message);
            setPassword("");
            setTimeout(() => backToLogin(), 1200);
        } catch (err) {
            setError(
                err.response?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-overlay">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
            >
                {view === "auth" && (
                    <>
                        <div className="auth-header">
                            <h2>📸 SocialMedia</h2>
                            <p>{isRegister ? "Join us today!" : "Welcome back!"}</p>
                        </div>

                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${!isRegister ? "active" : ""}`}
                                onClick={() => isRegister && toggleMode()}
                            >
                                Login
                            </button>
                            <button
                                className={`auth-tab ${isRegister ? "active" : ""}`}
                                onClick={() => !isRegister && toggleMode()}
                            >
                                Sign Up
                            </button>
                            <motion.div
                                className="auth-tab-indicator"
                                animate={{ x: isRegister ? "100%" : "0%" }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.form
                                key={isRegister ? "register" : "login"}
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0, x: isRegister ? 30 : -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isRegister ? -30 : 30 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            className="auth-error"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            ⚠️ {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {isRegister && (
                                    <div className="input-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="input-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {!isRegister && (
                                    <p className="auth-footer" style={{ margin: "-8px 0 16px", textAlign: "right" }}>
                                        <span onClick={goToForgotPassword}>Forgot password?</span>
                                    </p>
                                )}

                                <motion.button
                                    type="submit"
                                    className="auth-btn"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading ? "Processing..." : isRegister ? "Sign Up" : "Log In"}
                                </motion.button>
                            </motion.form>
                        </AnimatePresence>

                        <p className="auth-footer">
                            {isRegister ? "Already have an account? " : "New to SocialMedia? "}
                            <span onClick={toggleMode}>
                                {isRegister ? "Log In" : "Sign Up"}
                            </span>
                        </p>
                    </>
                )}

                {view === "forgotRequest" && (
                    <>
                        <div className="auth-header">
                            <h2>Reset Password</h2>
                            <p>Enter your email and we'll generate a reset link.</p>
                        </div>

                        <motion.form
                            onSubmit={handleForgotRequest}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="auth-error"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        ⚠️ {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your account email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="auth-btn"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </motion.button>
                        </motion.form>

                        <p className="auth-footer">
                            <span onClick={backToLogin}>← Back to Log In</span>
                        </p>
                    </>
                )}

                {view === "forgotReset" && (
                    <>
                        <div className="auth-header">
                            <h2>Set a New Password</h2>
                            <p>
                                {resetToken
                                    ? "This demo doesn't send real emails yet, so your reset code is pre-filled below."
                                    : "Enter the reset code you received and your new password."}
                            </p>
                        </div>

                        <motion.form
                            onSubmit={handleResetPassword}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="auth-error"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        ⚠️ {error}
                                    </motion.div>
                                )}
                                {!error && info && (
                                    <motion.div
                                        className="auth-error"
                                        style={{
                                            background: "rgba(34, 197, 94, 0.12)",
                                            borderColor: "rgba(34, 197, 94, 0.3)",
                                            color: "#86efac"
                                        }}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        ✅ {info}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="input-group">
                                <label>Reset Code</label>
                                <input
                                    type="text"
                                    name="resetCode"
                                    placeholder="Paste your reset code"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="At least 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    placeholder="Re-enter new password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="auth-btn"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </motion.button>
                        </motion.form>

                        <p className="auth-footer">
                            <span onClick={backToLogin}>← Back to Log In</span>
                        </p>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default AuthPage;
