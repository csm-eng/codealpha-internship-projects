const cartItemsContainer = document.getElementById("cartItems");
const cartLayout = document.getElementById("cartLayout");
const emptyCartMessage = document.getElementById("emptyCartMessage");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function loadCart() {
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 40px 0;">Loading cart items...</p>`;
    }

    let subtotal = 0;
    let itemsHTML = "";

    try {
        for (const item of cart) {
            const response = await fetch(`http://localhost:5000/api/products/${item.id}`);
            if (!response.ok) {
                continue;
            }
            const product = await response.json();
            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            itemsHTML += `
                <div class="cart-item">
                    <img src="${product.image || 'https://via.placeholder.com/80'}" alt="${product.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 600;"><a href="product.html?id=${product._id}">${product.name}</a></h3>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Category: ${product.category}</p>
                    </div>
                    <div class="cart-item-price" style="font-size: 0.95rem;">₹${product.price.toLocaleString('en-IN')}</div>
                    
                    <div class="quantity-selector" style="margin-bottom: 0;">
                        <button class="quantity-btn" onclick="changeQty('${item.id}', -1)" style="width: 28px; height: 28px; font-size: 0.9rem;">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" style="width: 30px; font-size: 0.9rem;" readonly>
                        <button class="quantity-btn" onclick="changeQty('${item.id}', 1)" style="width: 28px; height: 28px; font-size: 0.9rem;">+</button>
                    </div>
                    
                    <div class="cart-item-subtotal" style="font-size: 1.05rem;">₹${itemSubtotal.toLocaleString('en-IN')}</div>
                    <div>
                        <button class="btn btn-secondary btn-sm" onclick="removeItem('${item.id}')" style="color: var(--danger); padding: 6px 10px; border-color: rgba(239, 68, 68, 0.2); background-color: rgba(239, 68, 68, 0.05);">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = itemsHTML;
        }

        // Update Summary Card
        const summarySubtotal = document.getElementById("summarySubtotal");
        const summaryTotal = document.getElementById("summaryTotal");
        if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        if (summaryTotal) summaryTotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

        if (cartLayout) cartLayout.style.display = "grid";
        if (emptyCartMessage) emptyCartMessage.style.display = "none";

    } catch (error) {
        console.error(error);
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--danger); font-weight: 500; padding: 40px 0;">Failed to load cart items. Is backend running?</p>`;
        }
    }
}

function showEmptyCart() {
    if (cartLayout) cartLayout.style.display = "none";
    if (emptyCartMessage) emptyCartMessage.style.display = "block";
}

function changeQty(id, change) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeItem(id);
        return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateNavbar === "function") updateNavbar();
    loadCart();
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateNavbar === "function") updateNavbar();
    if (typeof showToast === "function") showToast("Item removed from cart", "success");
    loadCart();
}

// Load on start
loadCart();