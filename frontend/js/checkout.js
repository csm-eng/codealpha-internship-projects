const checkoutForm = document.getElementById("checkoutForm");
const checkoutItemsContainer = document.getElementById("checkoutItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTotal = document.getElementById("checkoutTotal");

const cart = JSON.parse(localStorage.getItem("cart")) || [];

// Autofill logged-in user details
function checkLoggedInUser() {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    
    if (name) document.getElementById("name").value = name;
    if (email) document.getElementById("email").value = email;
}

async function loadCheckoutSummary() {
    if (cart.length === 0) {
        if (typeof showToast === "function") {
            showToast("Your cart is empty!", "error");
        } else {
            alert("Your cart is empty!");
        }
        setTimeout(() => { window.location.href = "index.html"; }, 1000);
        return;
    }

    checkoutItemsContainer.innerHTML = "<p>Loading items...</p>";
    let totalAmount = 0;
    let itemsHTML = "";

    try {
        for (const item of cart) {
            const response = await fetch(`http://localhost:5000/api/products/${item.id}`);
            if (!response.ok) continue;
            const product = await response.json();
            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            itemsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                    <div>
                        <span style="font-weight: 600; color: var(--secondary);">${product.name}</span>
                        <span style="color: var(--text-muted); font-size: 0.8rem;"> x${item.quantity}</span>
                    </div>
                    <span style="font-weight: 500; color: var(--secondary);">₹${subtotal.toLocaleString('en-IN')}</span>
                </div>
            `;
        }

        checkoutItemsContainer.innerHTML = itemsHTML;
        checkoutSubtotal.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
        checkoutTotal.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;

    } catch (error) {
        console.error(error);
        checkoutItemsContainer.innerHTML = "<p style='color: var(--danger);'>Error loading summary.</p>";
    }
}

checkoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
    }

    let totalAmount = 0;
    try {
        for (const item of cart) {
            const response = await fetch(`http://localhost:5000/api/products/${item.id}`);
            if (!response.ok) continue;
            const product = await response.json();
            totalAmount += product.price * item.quantity;
        }
    } catch (error) {
        showToast("Error processing products info", "error");
        return;
    }

    const order = {
        customerName: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        products: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        })),
        totalAmount: totalAmount
    };

    try {
        const response = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        if (response.ok) {
            localStorage.removeItem("cart");
            if (typeof updateNavbar === "function") updateNavbar();
            showToast("Order Placed Successfully!", "success");
            setTimeout(() => {
                window.location.href = "order-success.html";
            }, 1000);
        } else {
            const data = await response.json();
            showToast(data.message || "Failed to place order.", "error");
        }
    } catch (error) {
        showToast("Connection to server failed.", "error");
        console.error(error);
    }
});

// Run
checkLoggedInUser();
loadCheckoutSummary();