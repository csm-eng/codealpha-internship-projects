// Global Toast notification utility
function showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s reverse forwards";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Dynamic Navbar logic
function updateNavbar() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    const navOrders = document.getElementById("navOrders");
    const navAdmin = document.getElementById("navAdmin");
    const navActions = document.getElementById("navActions");
    const cartCount = document.getElementById("cartCount");

    // Update cart badge
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    if (token) {
        if (navOrders) navOrders.style.display = "block";
        if (role === "admin") {
            if (navAdmin) navAdmin.style.display = "block";
        } else {
            if (navAdmin) navAdmin.style.display = "none";
        }

        if (navActions) {
            navActions.innerHTML = `
                <span style="font-size: 0.9rem; font-weight: 500; margin-right: 8px;">Hi, ${name || 'User'}</span>
                <button onclick="logout()" class="btn btn-secondary btn-sm">Logout</button>
            `;
        }
    } else {
        if (navOrders) navOrders.style.display = "none";
        if (navAdmin) navAdmin.style.display = "none";

        if (navActions) {
            navActions.innerHTML = `
                <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
                <a href="register.html" class="btn btn-primary btn-sm">Register</a>
            `;
        }
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    showToast("Logged out successfully", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

// REGISTER Form
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const user = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Registration successful! Redirecting to login...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                showToast(data.message || "Registration failed", "error");
            }
        } catch (error) {
            showToast("Server error occurred.", "error");
            console.error(error);
        }
    });
}

// LOGIN Form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const user = {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        };

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("name", data.name);
                localStorage.setItem("email", data.email);

                showToast("Login Successful! Redirecting...", "success");
                setTimeout(() => {
                    if (data.role === "admin") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "index.html";
                    }
                }, 1000);
            } else {
                showToast(data.message || "Invalid credentials", "error");
            }
        } catch (error) {
            showToast("Server error occurred.", "error");
            console.error(error);
        }
    });
}

// Initialize navbar state on DOM load
document.addEventListener("DOMContentLoaded", updateNavbar);