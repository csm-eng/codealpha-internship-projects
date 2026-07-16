const detailContainer = document.getElementById("productDetailContainer");
let product = null;

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) {
        detailContainer.innerHTML = `<p style="text-align: center; color: var(--danger); font-weight: 500; padding: 40px 0;">No Product ID specified.</p>`;
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        product = await response.json();
        renderProductDetails();
    } catch (error) {
        console.error(error);
        detailContainer.innerHTML = `<p style="text-align: center; color: var(--danger); font-weight: 500; padding: 40px 0;">Product details could not be loaded.</p>`;
    }
}

function renderProductDetails() {
    if (!product || !detailContainer) return;

    detailContainer.innerHTML = `
        <div class="product-detail-layout">
            <div class="detail-img-container">
                <img src="${product.image || 'https://via.placeholder.com/500'}" alt="${product.name}">
            </div>
            <div class="detail-info">
                <span class="detail-category">${product.category}</span>
                <h1 class="detail-title">${product.name}</h1>
                <div class="detail-price">₹${product.price.toLocaleString('en-IN')}</div>
                <p class="detail-desc">${product.description || 'No description available for this item.'}</p>
                
                <div class="quantity-selector">
                    <span style="font-weight: 500; margin-right: 12px; font-size: 0.95rem;">Quantity:</span>
                    <button class="quantity-btn" onclick="updateQty(-1)">-</button>
                    <input type="number" id="detailQty" class="quantity-input" value="1" min="1" readonly>
                    <button class="quantity-btn" onclick="updateQty(1)">+</button>
                </div>

                <button onclick="addDetailsToCart()" class="btn btn-primary" style="padding: 14px 28px; width: fit-content; font-size: 0.95rem;">
                    Add To Cart
                </button>
            </div>
        </div>
    `;
}

function updateQty(change) {
    const qtyInput = document.getElementById("detailQty");
    if (!qtyInput) return;
    let qty = parseInt(qtyInput.value) || 1;
    qty += change;
    if (qty < 1) qty = 1;
    qtyInput.value = qty;
}

function addDetailsToCart() {
    if (!product) return;
    const qtyInput = document.getElementById("detailQty");
    const quantity = parseInt(qtyInput.value) || 1;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.id === product._id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: product._id, quantity: quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    if (typeof updateNavbar === "function") {
        updateNavbar();
    }
    
    if (typeof showToast === "function") {
        showToast(`${quantity}x ${product.name} added to cart!`, "success");
    } else {
        alert(`${quantity}x ${product.name} added to cart!`);
    }
}

// Load on start
loadProductDetails();
