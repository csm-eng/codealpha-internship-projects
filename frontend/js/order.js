const ordersContainer = document.getElementById("ordersContainer");

async function loadMyOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
        ordersContainer.innerHTML = `<p style="text-align: center; color: var(--danger); font-weight: 500; padding: 40px 0;">Please log in to view your orders.</p>`;
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/orders/mine", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch orders");
        }

        const orders = await response.json();
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; background-color: var(--card-bg); border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                    <p style="color: var(--text-muted); margin-bottom: 20px;">You haven't placed any orders yet.</p>
                    <a href="index.html" class="btn btn-primary btn-sm">Shop Now</a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = "<p style='text-align: center; color: var(--text-muted); padding: 20px 0;'>Loading details...</p>";
        
        let ordersHTML = "";
        
        const productCache = {};
        const getProduct = async (id) => {
            if (productCache[id]) return productCache[id];
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    productCache[id] = data;
                    return data;
                }
            } catch (e) {
                console.error("Error fetching product details", e);
            }
            return null;
        };

        for (const order of orders) {
            const date = new Date(order.orderDate).toLocaleDateString("en-IN", {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            const statusClass = order.status.toLowerCase();
            
            let itemsHTML = "";
            for (const item of order.products) {
                const product = await getProduct(item.productId);
                const pName = product ? product.name : "Unknown Product";
                const pPrice = product ? product.price : 0;
                
                itemsHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #f1f5f9; font-size: 0.9rem;">
                        <span>${pName} <strong style="color: var(--text-muted);">x${item.quantity}</strong></span>
                        <span>₹${(pPrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                `;
            }

            ordersHTML += `
                <div style="background-color: var(--card-bg); border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 24px; display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">ORDER ID</span>
                            <strong style="font-family: var(--font-heading); color: var(--secondary); font-size: 0.9rem;">#${order._id}</strong>
                        </div>
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">DATE PLACED</span>
                            <span style="font-size: 0.9rem; font-weight: 500;">${date}</span>
                        </div>
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">STATUS</span>
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">ITEMS</span>
                        ${itemsHTML}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 12px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">SHIPPING ADDRESS</span>
                            <span style="font-size: 0.85rem; color: var(--text-main); font-weight: 500;">${order.address}</span>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">TOTAL PAID</span>
                            <strong style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--secondary);">₹${order.totalAmount.toLocaleString('en-IN')}</strong>
                        </div>
                    </div>
                </div>
            `;
        }

        ordersContainer.innerHTML = ordersHTML;

    } catch (error) {
        console.error(error);
        ordersContainer.innerHTML = `<p style="text-align: center; color: var(--danger); font-weight: 500; padding: 40px 0;">Failed to load orders. Make sure server is running.</p>`;
    }
}

// Load on start
loadMyOrders();
