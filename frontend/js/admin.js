// Auth Check
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
    alert("Access Denied. Admins Only!");
    window.location.href = "login.html";
}

// Global Variables
const productForm = document.getElementById("productForm");
const productsTableBody = document.getElementById("productsTableBody");
const ordersTableBody = document.getElementById("ordersTableBody");
const submitBtn = document.getElementById("submitBtn");
const resetProductFormBtn = document.getElementById("resetProductFormBtn");
const productSecTitle = document.getElementById("productSecTitle");

// Sidebar switching
function switchSection(sectionId) {
    const sections = document.querySelectorAll(".admin-content-section");
    sections.forEach(s => s.classList.remove("active"));
    
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add("active");

    const navItems = document.querySelectorAll(".sidebar-nav-item");
    navItems.forEach(item => {
        if (item.getAttribute("onclick").includes(sectionId)) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    if (sectionId === "overview") {
        loadStats();
    } else if (sectionId === "products") {
        loadProducts();
    } else if (sectionId === "orders") {
        loadOrders();
    }
}

// Load stats metrics
async function loadStats() {
    try {
        const prodRes = await fetch("http://localhost:5000/api/products");
        const products = await prodRes.json();
        
        const ordRes = await fetch("http://localhost:5000/api/orders", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const orders = await ordRes.json();

        // Calculate
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        document.getElementById("statProducts").textContent = products.length;
        document.getElementById("statOrders").textContent = orders.length;
        document.getElementById("statSales").textContent = `₹${totalSales.toLocaleString('en-IN')}`;

    } catch (e) {
        console.error("Error loading admin stats:", e);
    }
}

// Load Products Catalog Table
async function loadProducts() {
    try {
        const response = await fetch("http://localhost:5000/api/products");
        const products = await response.json();
        
        if (!productsTableBody) return;
        productsTableBody.innerHTML = "";

        products.forEach(product => {
            productsTableBody.innerHTML += `
                <tr>
                    <td><img src="${product.image || 'https://via.placeholder.com/50'}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" alt=""></td>
                    <td style="font-weight: 600; color: var(--secondary);">${product.name}</td>
                    <td>${product.category}</td>
                    <td style="font-weight: 500;">₹${product.price.toLocaleString('en-IN')}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="editProduct('${product._id}')" style="padding: 4px 8px; margin-right: 5px;">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')" style="padding: 4px 8px;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error loading products table", e);
    }
}

// Add / Update Product Form submit
if (productForm) {
    productForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = document.getElementById("productId").value;
        const product = {
            name: document.getElementById("name").value,
            price: Number(document.getElementById("price").value),
            description: document.getElementById("description").value,
            image: document.getElementById("image").value,
            category: document.getElementById("category").value
        };

        let url = "http://localhost:5000/api/products";
        let method = "POST";

        if (id) {
            url = `http://localhost:5000/api/products/${id}`;
            method = "PUT";
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(product)
            });

            if (response.ok) {
                showToast(id ? "Product updated successfully!" : "Product added successfully!", "success");
                resetProductForm();
                loadProducts();
            } else {
                const data = await response.json();
                showToast(data.message || "Failed to save product", "error");
            }
        } catch (err) {
            showToast("Server connection error.", "error");
            console.error(err);
        }
    });
}

// Edit product populate
async function editProduct(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const product = await response.json();

        document.getElementById("productId").value = product._id;
        document.getElementById("name").value = product.name;
        document.getElementById("price").value = product.price;
        document.getElementById("description").value = product.description;
        document.getElementById("image").value = product.image;
        document.getElementById("category").value = product.category;

        if (submitBtn) submitBtn.innerHTML = "Update Product";
        if (productSecTitle) productSecTitle.innerHTML = "Edit Product Details";
        if (resetProductFormBtn) resetProductFormBtn.style.display = "inline-flex";
        
        document.getElementById("productForm").scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        console.error(e);
    }
}

// Reset form
function resetProductForm() {
    if (productForm) productForm.reset();
    document.getElementById("productId").value = "";
    if (submitBtn) submitBtn.innerHTML = "Add Product";
    if (productSecTitle) productSecTitle.innerHTML = "Add New Product";
    if (resetProductFormBtn) resetProductFormBtn.style.display = "none";
}

// Delete product
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product from the catalog?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            showToast("Product deleted successfully", "success");
            loadProducts();
        } else {
            const data = await response.json();
            showToast(data.message || "Failed to delete product", "error");
        }
    } catch (e) {
        console.error(e);
    }
}

// Load Customer Orders
async function loadOrders() {
    try {
        const response = await fetch("http://localhost:5000/api/orders", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const orders = await response.json();

        if (!ordersTableBody) return;
        ordersTableBody.innerHTML = "";

        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px 0;">No customer orders found.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const date = new Date(order.orderDate).toLocaleDateString("en-IN", {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            const statusClass = order.status.toLowerCase();

            ordersTableBody.innerHTML += `
                <tr>
                    <td style="font-family: var(--font-heading); font-weight: 600; font-size: 0.85rem;">#${order._id}</td>
                    <td>
                        <strong style="display: block; color: var(--secondary);">${order.customerName}</strong>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${order.email} | ${order.phone}</span>
                    </td>
                    <td>${date}</td>
                    <td style="font-weight: 600;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                    <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                    <td>
                        <select onchange="updateOrderStatus('${order._id}', this.value)" class="form-control" style="width: auto; padding: 4px 8px; font-size: 0.8rem; display: inline-block;">
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading orders:", err);
    }
}

// Update order status on change
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            showToast("Order status updated successfully", "success");
            loadOrders();
        } else {
            const data = await response.json();
            showToast(data.message || "Failed to update order status", "error");
        }
    } catch (e) {
        console.error("Error updating status:", e);
    }
}

// Init stats
loadStats();