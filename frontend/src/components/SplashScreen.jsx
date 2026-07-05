import { motion } from "framer-motion";

function SplashScreen() {
    return (
        <div className="splash-screen">
            {/* Ripple rings */}
            <motion.div 
                className="splash-ring"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2.2, opacity: [0, 0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div 
                className="splash-ring"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2.2, opacity: [0, 0.4, 0] }}
                transition={{ duration: 2, delay: 0.7, repeat: Infinity, ease: "easeOut" }}
            />

            {/* Glowing brand icon */}
            <motion.div 
                className="splash-icon-wrapper"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ 
                    scale: [0, 1.2, 1], 
                    rotate: 0,
                    boxShadow: [
                        "0 0 20px rgba(139, 92, 246, 0.3)",
                        "0 0 40px rgba(168, 85, 247, 0.6)",
                        "0 0 20px rgba(139, 92, 246, 0.3)"
                    ]
                }}
                transition={{ 
                    scale: { type: "spring", stiffness: 120, damping: 12 },
                    rotate: { duration: 0.6, ease: "easeOut" },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
            >
                <span className="splash-emoji" role="img" aria-label="logo">📸</span>
            </motion.div>

            {/* Glowing Brand Name */}
            <motion.h1
                className="splash-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
            >
                SocialMedia
            </motion.h1>

            <motion.p
                className="splash-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.5] }}
                transition={{ delay: 0.8, duration: 1.2 }}
            >
                Connecting your world...
            </motion.p>
        </div>
    );
}

export default SplashScreen;
