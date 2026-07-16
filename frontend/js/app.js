const productContainer = document.getElementById("products");
let allProducts = [];

async function loadProducts() {
    try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error loading products:", error);
        if (productContainer) {
            productContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--danger); font-weight: 500; padding: 40px 0;">Failed to load products. Make sure backend is running!</p>`;
        }
    }
}

function renderProducts(products) {
    if (!productContainer) return;
    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No products found in this category.</p>`;
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-img-wrapper" onclick="goToProductDetails('${product._id}')" style="cursor: pointer;">
                <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}">
                <span class="product-category-tag">${product.category}</span>
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="goToProductDetails('${product._id}')" style="cursor: pointer;">${product.name}</h3>
                <p class="product-desc">${product.description || 'No description available.'}</p>
                <div class="product-meta">
                    <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
                    <button onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}')" class="btn btn-primary btn-sm">
                        Add To Cart
                    </button>
                </div>
            </div>
        `;
        productContainer.appendChild(card);
    });
}

function goToProductDetails(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function filterCategory(category) {
    const tabs = document.querySelectorAll(".category-tab");
    tabs.forEach(tab => {
        const tabText = tab.textContent.toLowerCase();
        if (category === "All" && tabText.includes("all")) {
            tab.classList.add("active");
        } else if (category === "Home" && tabText.includes("home")) {
            tab.classList.add("active");
        } else if (tabText.includes(category.toLowerCase())) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    if (category === "All") {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
        renderProducts(filtered);
    }
}

function addToCart(productId, productName) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Update navbar badge count
    if (typeof updateNavbar === "function") {
        updateNavbar();
    }
    
    if (typeof showToast === "function") {
        showToast(`${productName} added to cart!`, "success");
    } else {
        alert(`${productName} added to cart!`);
    }
}

// Load on start
if (productContainer) {
    loadProducts();
}