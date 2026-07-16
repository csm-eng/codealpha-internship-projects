const bcrypt = require("bcrypt");
const Product = require("../models/Product");
const User = require("../models/User");

const seedDatabase = async () => {
    try {
        // 1. Seed Admin User if not exists
        const adminEmail = "admin@ecommerce.com";
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("adminpassword", 10);
            const adminUser = new User({
                name: "Store Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin"
            });
            await adminUser.save();
            console.log("Admin user seeded successfully!");
        }

        // 2. Seed Products if less than 10
        const count = await Product.countDocuments();
        if (count < 10) {
            await Product.deleteMany({});
            const products = [

                {
                    name: "Premium Wireless Headphones",
                    price: 14999,
                    description: "High-fidelity sound, advanced active noise cancellation (ANC), and up to 40 hours of wireless playback with ultra-plush earcups.",
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
                },
                {
                    name: "Ergonomic Mechanical Keyboard",
                    price: 8499,
                    description: "Tactile mechanical switches, customizable RGB backlighting, and a premium aluminum top frame for maximum typing efficiency and speed.",
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80"
                },
                {
                    name: "Ultra-Slim Smart Watch",
                    price: 12999,
                    description: "Always-on AMOLED display, heart rate and blood oxygen monitoring, GPS tracking, and up to 7 days of smart battery performance.",
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
                },
                {
                    name: "Premium Leather Backpack",
                    price: 5999,
                    description: "Handcrafted from water-resistant full-grain leather, featuring a padded 15.6-inch laptop sleeve and hidden anti-theft organizer pockets.",
                    category: "Fashion",
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"
                },
                {
                    name: "Minimalist Water Bottle",
                    price: 1499,
                    description: "Double-walled vacuum insulated stainless steel flask. Keeps beverages ice-cold for 24 hours or steaming-hot for 12 hours.",
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80"
                },
                {
                    name: "Classic Aviator Sunglasses",
                    price: 3499,
                    description: "Polarized UV400 lenses with a lightweight, durable titanium alloy frame, offering timeless style and complete glare protection.",
                    category: "Fashion",
                    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80"
                },
                {
                    name: "Ergonomic Office Chair",
                    price: 18999,
                    description: "Breathable mesh back, adjustable 3D armrests, dynamic lumbar support, and smooth-rolling castors for long hours of comfortable work.",
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&q=80"
                },
                {
                    name: "Portable Bluetooth Speaker",
                    price: 4999,
                    description: "IPX7 waterproof rating, deep bass, 360-degree sound projection, and a rugged carry-strap perfect for outdoor adventures.",
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80"
                },
                {
                    name: "Smart LED Desk Lamp",
                    price: 2999,
                    description: "Adjustable color temperature, step-less dimming levels, built-in wireless smartphone charger, and eye-friendly diffusion lighting.",
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"
                },
                {
                    name: "Ultra-Light Running Shoes",
                    price: 6499,
                    description: "Responsive foam cushioning, breathable knit upper, and high-traction rubber outsole engineered for speed and comfort.",
                    category: "Sports",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
                },
                {
                    name: "High-Performance Blender",
                    price: 7999,
                    description: "1200-watt commercial-grade motor, hardened stainless steel blades, and variable speed settings for smoothies, purees, and crushed ice.",
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500&q=80"
                },
                {
                    name: "Lavender Scented Candle",
                    price: 999,
                    description: "Hand-poured 100% natural soy wax infused with therapeutic French lavender essential oils, featuring a clean-burning wood wick.",
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80"
                }
            ];
            await Product.insertMany(products);
            console.log("Database seeded with 12 premium products!");
        } else {
            console.log("Products already exist in database, skipping product seed.");
        }
    } catch (error) {
        console.error("Database seeding error:", error);
    }
};

module.exports = seedDatabase;
