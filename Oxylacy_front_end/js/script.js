document.addEventListener('DOMContentLoaded', () => {

    /* =======================================================
       1. Mobile Navigation Toggle
    ======================================================= */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    /* =======================================================
       2. Shop Page Live Filtering (Timepieces, Apparel, Leather)
    ======================================================= */
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                // Dynamically fetch the current cards after API renders them
                const currentProductCards = document.querySelectorAll('.products-grid .product-card');

                currentProductCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /* =======================================================
       3. Product Details Page: Variant Selector & Quantity
    ======================================================= */
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const siblings = btn.parentElement.querySelectorAll('.option-btn');
            siblings.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    /* =======================================================
       4. Shopping Bag / Cart Live Calculations & Interactions
    ======================================================= */
    const cartRows = document.querySelectorAll('.cart-item-row');

    function updateCartTotals() {
        let currentTotal = 0;
        let totalItemsCount = 0;
        const activeRows = document.querySelectorAll('.cart-item-row');

        activeRows.forEach(row => {
            const priceText = row.querySelector('.item-unit-price').textContent.replace('$', '').trim();
            const unitPrice = parseFloat(priceText);
            const qtyInput = row.querySelector('.qty-input');
            const qty = parseInt(qtyInput.value) || 1;

            const rowSubtotal = unitPrice * qty;
            const totalEl = row.querySelector('.cart-item-total');
            if (totalEl) {
                totalEl.textContent = `$${rowSubtotal.toFixed(2)}`;
            }

            currentTotal += rowSubtotal;
            totalItemsCount += qty;
        });

        // Update Summary Box
        const bagSubtotalEl = document.querySelector('.summary-val');
        const totalDueEl = document.querySelector('.total-price');
        const cartBadge = document.querySelector('.cart-count');

        if (bagSubtotalEl) bagSubtotalEl.textContent = `$${currentTotal.toFixed(2)}`;
        if (totalDueEl) totalDueEl.textContent = `$${currentTotal.toFixed(2)}`;
        if (cartBadge) cartBadge.textContent = totalItemsCount;
    }

    // Quantity Increment/Decrement across Cart & Details
    const quantityContainers = document.querySelectorAll('.quantity-wrapper');
    quantityContainers.forEach(container => {
        const minusBtn = container.querySelector('.qty-btn:first-child');
        const plusBtn = container.querySelector('.qty-btn:last-child');
        const input = container.querySelector('.qty-input');

        if (minusBtn && plusBtn && input) {
            minusBtn.addEventListener('click', () => {
                let currentVal = parseInt(input.value) || 1;
                if (currentVal > 1) {
                    input.value = currentVal - 1;
                    updateCartTotals();
                }
            });

            plusBtn.addEventListener('click', () => {
                let currentVal = parseInt(input.value) || 1;
                if (currentVal < 10) {
                    input.value = currentVal + 1;
                    updateCartTotals();
                }
            });
        }
    });

    // Remove Item from Cart
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('.cart-item-row');
            if (row) {
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    updateCartTotals();
                }, 200);
            }
        });
    });

    /* =======================================================
       5. Global Add to Cart Feedback
    ======================================================= */
    const addToCartAction = document.querySelector('.add-to-cart-action');
    if (addToCartAction) {
        addToCartAction.addEventListener('click', (e) => {
            e.preventDefault();
            const originalText = addToCartAction.textContent;
            addToCartAction.textContent = '✓ Added to Atelier Bag';
            addToCartAction.style.background = '#1E2B28';
            addToCartAction.style.color = '#FFF';

            const cartBadge = document.querySelector('.cart-count');
            if (cartBadge) {
                const current = parseInt(cartBadge.textContent) || 0;
                cartBadge.textContent = current + 1;
            }

            setTimeout(() => {
                addToCartAction.textContent = originalText;
                addToCartAction.style.background = '';
                addToCartAction.style.color = '';
            }, 2000);
        });
    }
    /* =======================================================
       6. Contact Form Submission Success Feedback
    ======================================================= */
    const luxuryForm = document.querySelector('.luxury-form');
    if (luxuryForm) {
        luxuryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = luxuryForm.querySelector('.send-msg-btn');

            submitBtn.textContent = 'Transmitting to Atelier...';
            submitBtn.style.opacity = '0.7';

            setTimeout(() => {
                luxuryForm.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; background: rgba(197, 168, 128, 0.05); border: 1px solid #c5a880; border-radius: 4px;">
                        <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; color: #c5a880; margin-bottom: 15px; display: block;"></i>
                        <h3 style="color: #fff; font-family: var(--font-heading); margin-bottom: 8px;">Inquiry Transmitted</h3>
                        <p style="color: #8c9b98; font-size: 0.9rem; line-height: 1.6;">Thank you. An atelier concierge specialist will review your request and respond within 24 hours.</p>
                    </div>
                `;
            }, 1000);
        });
    }

    /* =======================================================
       7. Fetch Products from MongoDB API
    ======================================================= */
    const productsGrid = document.querySelector('.products-grid');

    if (productsGrid) {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(products => {
                if (products && products.length > 0) {
                    productsGrid.innerHTML = ''; // Clear static dummy cards

                    products.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'product-card';
                        card.setAttribute('data-category', item.category.toLowerCase());

                        card.innerHTML = `
                            <div class="product-img-box">
                                <img src="${item.image}" alt="${item.name}" class="product-img">
                                ${item.tag ? `<span class="product-badge">${item.tag}</span>` : ''}
                            </div>
                            <div class="product-info">
                                <span class="product-category">${item.category}</span>
                                <h3 class="product-name">${item.name}</h3>
                                <p class="product-price">$${item.price.toFixed(2)} ${item.originalPrice ? `<span class="old-price" style="text-decoration: line-through; opacity: 0.6; margin-left: 6px;">$${item.originalPrice.toFixed(2)}</span>` : ''}</p>
                                <a href="product-details.html?id=${item._id}" class="btn-product">View Details</a>
                            </div>
                        `;
                        productsGrid.appendChild(card);
                    });
                }
            })
            .catch(err => console.error('Error loading products from backend:', err));
    }

    /* =======================================================
       8. Dynamic Single Product Details Page
    ======================================================= */
    const detailsSection = document.querySelector('.product-details-section');

    if (detailsSection) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            fetch(`http://localhost:5000/api/products/${productId}`)
                .then(res => res.json())
                .then(product => {
                    if (product && !product.message) {
                        // Title
                        document.title = `${product.name} — OXYLACY`;

                        // Breadcrumb
                        const breadcrumb = document.querySelector('.breadcrumb');
                        if (breadcrumb) {
                            breadcrumb.innerHTML = `
                                <a href="index.html">Home</a> / 
                                <a href="shop.html">${(product.category || 'Catalog').toUpperCase()}</a> / 
                                <span>${product.name}</span>
                            `;
                        }

                        // Main Image & Badge
                        const mainImg = document.getElementById('mainProductImg');
                        if (mainImg) {
                            mainImg.src = product.image;
                            mainImg.alt = product.name;
                            mainImg.style.opacity = '1';
                        }

                        const badge = document.querySelector('.main-image-box .product-badge');
                        if (badge) {
                            badge.textContent = product.tag || 'Luxury';
                            badge.style.display = product.tag ? 'inline-block' : 'none';
                        }

                        // Category Subtitle
                        const categorySubtitle = document.querySelector('.product-summary .section-subtitle');
                        if (categorySubtitle) {
                            categorySubtitle.textContent = `${(product.category || 'Luxury').toUpperCase()} COLLECTION`;
                        }

                        // Title
                        const detailsTitle = document.querySelector('.details-title');
                        if (detailsTitle) {
                            detailsTitle.textContent = product.name;
                        }

                        // Price
                        const detailsPrice = document.querySelector('.details-price');
                        if (detailsPrice) {
                            detailsPrice.innerHTML = `$${product.price}.00 ${product.originalPrice ? `<span style="font-size: 0.6em; text-decoration: line-through; opacity: 0.6; margin-left: 8px;">$${product.originalPrice}.00</span>` : ''}`;
                        }

                        // Description
                        const detailsDesc = document.querySelector('.details-description');
                        if (detailsDesc) {
                            detailsDesc.textContent = product.description;
                        }
                    }
                })
                .catch(err => {
                    console.error('Error loading product details:', err);
                });
        }
    }

    /* =======================================================
   9. Cart Functionality (Local Storage)
======================================================= */
    // Cart Update Helper
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');

        cartCountElements.forEach(el => {
            el.textContent = totalCount;
        });
    }

    // Add to Cart Helper Function
    function addToCart(product, quantity = 1) {
        let cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];

        const existingIndex = cart.findIndex(item => item.id === product.id);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        localStorage.setItem('oxylacy_cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} has been added to your Atelier Bag!`);
    }

    // Initialize count on page load
    updateCartCount();

    // Product Details Page: Add to Cart Button Click
    const addToCartDetailsBtn = document.querySelector('.add-to-cart-action');
    if (addToCartDetailsBtn) {
        addToCartDetailsBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            const title = document.querySelector('.details-title')?.textContent || 'Luxury Product';
            const priceText = document.querySelector('.details-price')?.textContent || '$0';
            const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
            const img = document.getElementById('mainProductImg')?.src || '';
            const qtyInput = document.querySelector('.qty-input');
            const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

            if (productId) {
                addToCart({
                    id: productId,
                    name: title,
                    price: price,
                    image: img
                }, quantity);
            }
        });
    }

    /* =======================================================
   10. Dynamic Cart Page Rendering & Calculation
======================================================= */
    const cartItemsContainer = document.querySelector('.cart-items-container');

    if (cartItemsContainer) {
        function renderCartPage() {
            const cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];
            const tableHeader = document.querySelector('.cart-table-header');
            const actionsRow = document.querySelector('.cart-actions-row');

            // Remove existing dynamic rows (keep header and continue shopping button)
            const existingRows = cartItemsContainer.querySelectorAll('.cart-item-row, .empty-cart-msg');
            existingRows.forEach(row => row.remove());

            if (cart.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'empty-cart-msg';
                emptyMsg.style.padding = '40px 0';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.innerHTML = `
                <p style="font-size: 1.1rem; color: #a1a1aa; margin-bottom: 20px;">Your Atelier Bag is currently empty.</p>
                <a href="shop.html" class="btn btn-outline">Explore The Collection</a>
            `;
                if (actionsRow) {
                    cartItemsContainer.insertBefore(emptyMsg, actionsRow);
                } else {
                    cartItemsContainer.appendChild(emptyMsg);
                }
                updateSummary(0);
                return;
            }

            let totalCartPrice = 0;

            cart.forEach((item, index) => {
                const itemSubtotal = item.price * item.quantity;
                totalCartPrice += itemSubtotal;

                const row = document.createElement('div');
                row.classList.add('cart-item-row');
                row.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-meta">
                        <h4 class="item-name">${item.name}</h4>
                        <span class="item-unit-price">$${item.price.toFixed(2)}</span>
                    </div>
                </div>
                <div class="cart-item-qty">
                    <div class="quantity-wrapper">
                        <button class="qty-btn qty-minus" data-index="${index}">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="10" class="qty-input" readonly>
                        <button class="qty-btn qty-plus" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="cart-item-total">$${itemSubtotal.toFixed(2)}</div>
                <button class="remove-item-btn" data-index="${index}" title="Remove creation">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

                if (actionsRow) {
                    cartItemsContainer.insertBefore(row, actionsRow);
                } else {
                    cartItemsContainer.appendChild(row);
                }
            });

            updateSummary(totalCartPrice);
            attachCartEvents();
        }

        function updateSummary(total) {
            const subtotalEl = document.querySelector('.summary-row .summary-val');
            const totalEl = document.querySelector('.summary-total-row .total-price');

            if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
            if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        }

        function attachCartEvents() {
            const cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];

            // Increase Quantity (+)
            document.querySelectorAll('.qty-plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.getAttribute('data-index');
                    if (cart[index] && cart[index].quantity < 10) {
                        cart[index].quantity += 1;
                        localStorage.setItem('oxylacy_cart', JSON.stringify(cart));
                        renderCartPage();
                        updateCartCount();
                    }
                });
            });

            // Decrease Quantity (-)
            document.querySelectorAll('.qty-minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.getAttribute('data-index');
                    if (cart[index] && cart[index].quantity > 1) {
                        cart[index].quantity -= 1;
                        localStorage.setItem('oxylacy_cart', JSON.stringify(cart));
                        renderCartPage();
                        updateCartCount();
                    }
                });
            });

            // Remove Product (X)
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.getAttribute('data-index');
                    cart.splice(index, 1);
                    localStorage.setItem('oxylacy_cart', JSON.stringify(cart));
                    renderCartPage();
                    updateCartCount();
                });
            });
        }

        // Render cart on load
        renderCartPage();
    }

    /* =======================================================
   11. Dynamic Featured Products for Homepage (index.html)
======================================================= */
    const featuredSection = document.querySelector('.featured-products-section .products-grid');

    if (featuredSection) {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(products => {
                if (products && products.length > 0) {
                    // Feature products filter (shudu featured gulo nibe, na thakle first 6 ta nibe)
                    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6);
                    const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

                    featuredSection.innerHTML = ''; // Clear static dummy items

                    displayProducts.forEach(product => {
                        const card = document.createElement('div');
                        card.className = 'product-card';
                        card.setAttribute('data-category', (product.category || 'all').toLowerCase());

                        card.innerHTML = `
                        <div class="product-img-box">
                            <img src="${product.image}" alt="${product.name}" class="product-img">
                            ${product.tag ? `<span class="product-badge">${product.tag}</span>` : ''}
                        </div>
                        <div class="product-info">
                            <span class="product-category">${product.category || 'Luxury'}</span>
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">$${product.price.toFixed(2)} ${product.originalPrice ? `<span style="font-size: 0.85em; text-decoration: line-through; opacity: 0.6; margin-left: 6px;">$${product.originalPrice.toFixed(2)}</span>` : ''}</p>
                            <a href="product-details.html?id=${product._id}" class="btn-product">View Details</a>
                        </div>
                    `;
                        featuredSection.appendChild(card);
                    });
                }
            })
            .catch(err => console.error('Error loading featured products on homepage:', err));
    }

    /* =======================================================
   12. Checkout Form & Order Submission
======================================================= */
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutItemsList = document.getElementById('checkoutItemsList');

    if (checkoutForm && checkoutItemsList) {
        const cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];
        let grandTotal = 0;

        if (cart.length === 0) {
            checkoutItemsList.innerHTML = '<p style="color: #a1a1aa; font-size: 0.9rem;">No creations in bag.</p>';
        } else {
            checkoutItemsList.innerHTML = '';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                grandTotal += itemTotal;

                const itemDiv = document.createElement('div');
                itemDiv.style.display = 'flex';
                itemDiv.style.justifyContent = 'space-between';
                itemDiv.style.alignItems = 'center';
                itemDiv.style.marginBottom = '12px';
                itemDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 3px;">
                    <div>
                        <div style="color: #fff; font-size: 0.85rem; font-weight: 500;">${item.name}</div>
                        <div style="color: #a1a1aa; font-size: 0.75rem;">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
                    </div>
                </div>
                <span style="color: #d4af37; font-size: 0.9rem; font-weight: 600;">$${itemTotal.toFixed(2)}</span>
            `;
                checkoutItemsList.appendChild(itemDiv);
            });
        }

        const subtotalEl = document.getElementById('checkoutSubtotal');
        const totalEl = document.getElementById('checkoutTotal');
        if (subtotalEl) subtotalEl.textContent = `$${grandTotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;

        // Handle Order Submit
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('Your bag is empty! Please add products before placing an order.');
                return;
            }

            const orderData = {
                customer: {
                    name: document.getElementById('custName').value,
                    email: document.getElementById('custEmail').value,
                    phone: document.getElementById('custPhone').value,
                    country: document.getElementById('custCountry').value,
                    address: document.getElementById('custAddress').value,
                    city: document.getElementById('custCity').value,
                    postal: document.getElementById('custPostal').value
                },
                items: cart,
                totalAmount: grandTotal,
                paymentMethod: 'Cash On Delivery'
            };

            const submitBtn = document.getElementById('placeOrderBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing Order...';

            try {
                const res = await fetch('http://localhost:5000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                const data = await res.json();

                if (data.success) {
                    localStorage.removeItem('oxylacy_cart');
                    alert('✨ Congratulations! Your order has been placed successfully.\nOrder ID: ' + data.order._id);
                    window.location.href = 'index.html';
                } else {
                    alert('Order placement failed: ' + data.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'CONFIRM & PLACE ATELIER ORDER';
                }
            } catch (err) {
                console.error('Order error:', err);
                alert('Failed to connect to the server.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'CONFIRM & PLACE ATELIER ORDER';
            }
        });
    }

    /* =======================================================
   13. Admin Panel Logic (Orders & Products)
======================================================= */
    const ordersTableBody = document.getElementById('ordersTableBody');
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    const addProductForm = document.getElementById('addProductForm');

    if (ordersTableBody) {
        async function loadAdminOrders() {
            ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#a1a1aa;">Fetching Atelier Orders...</td></tr>';

            try {
                const res = await fetch('http://localhost:5000/api/orders');
                const data = await res.json();

                if (!data.success || !data.orders || data.orders.length === 0) {
                    ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#a1a1aa;">No acquisition records found.</td></tr>';
                    document.getElementById('statTotalOrders').textContent = '0';
                    document.getElementById('statTotalRevenue').textContent = '$0.00';
                    document.getElementById('statPendingOrders').textContent = '0';
                    return;
                }

                let totalRev = 0;
                let pendingCount = 0;
                ordersTableBody.innerHTML = '';

                data.orders.forEach(order => {
                    totalRev += (order.totalAmount || 0);
                    if (order.status === 'Pending') pendingCount++;

                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    const itemsSummary = order.items.map(i => `${i.name} (×${i.quantity})`).join('<br>');

                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
                    row.innerHTML = `
                    <td style="padding: 16px 15px;">
                        <span style="color: #d4af37; font-weight: 600; font-size: 0.8rem;">#${order._id.slice(-6)}</span><br>
                        <span style="color: #71717a; font-size: 0.75rem;">${orderDate}</span>
                    </td>
                    <td style="padding: 16px 15px;">
                        <strong style="color: #fff;">${order.customer?.name || 'N/A'}</strong><br>
                        <span style="color: #a1a1aa; font-size: 0.75rem;">${order.customer?.email || ''}</span><br>
                        <span style="color: #71717a; font-size: 0.75rem;">${order.customer?.city || ''}, ${order.customer?.country || ''}</span>
                    </td>
                    <td style="padding: 16px 15px; font-size: 0.8rem; color: #d4d4d8;">
                        ${itemsSummary}
                    </td>
                    <td style="padding: 16px 15px; color: #d4af37; font-weight: 600;">
                        $${(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style="padding: 16px 15px;">
                        <select class="status-select" data-id="${order._id}" style="background: #18181b; color: #e4e4e7; border: 1px solid rgba(255,255,255,0.2); padding: 5px 8px; border-radius: 3px; font-size: 0.75rem;">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                    <td style="padding: 16px 15px; text-align: right;">
                        <button class="delete-order-btn" data-id="${order._id}" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;
                    ordersTableBody.appendChild(row);
                });

                // Update stats
                document.getElementById('statTotalOrders').textContent = data.orders.length;
                document.getElementById('statTotalRevenue').textContent = `$${totalRev.toFixed(2)}`;
                document.getElementById('statPendingOrders').textContent = pendingCount;

                // Status change handler
                document.querySelectorAll('.status-select').forEach(sel => {
                    sel.addEventListener('change', async (e) => {
                        const id = e.target.getAttribute('data-id');
                        const newStatus = e.target.value;
                        try {
                            await fetch(`http://localhost:5000/api/orders/${id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: newStatus })
                            });
                            alert('Order status updated to: ' + newStatus);
                            loadAdminOrders();
                        } catch (err) {
                            alert('Failed to update status');
                        }
                    });
                });

                // Delete order handler
                document.querySelectorAll('.delete-order-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = btn.getAttribute('data-id');
                        if (confirm('Are you sure you want to remove this acquisition record?')) {
                            try {
                                await fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' });
                                loadAdminOrders();
                            } catch (err) {
                                alert('Failed to delete order');
                            }
                        }
                    });
                });

            } catch (err) {
                console.error('Admin order fetch error:', err);
                ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#ef4444;">Failed to connect to backend server.</td></tr>';
            }
        }

        if (refreshOrdersBtn) {
            refreshOrdersBtn.addEventListener('click', loadAdminOrders);
        }
        loadAdminOrders();
    }

    // Add New Product Handler
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productPayload = {
                name: document.getElementById('pName').value,
                category: document.getElementById('pCategory').value,
                price: parseFloat(document.getElementById('pPrice').value),
                originalPrice: document.getElementById('pOriginalPrice').value ? parseFloat(document.getElementById('pOriginalPrice').value) : null,
                tag: document.getElementById('pTag').value || '',
                image: document.getElementById('pImage').value,
                description: document.getElementById('pDescription').value,
                rating: 5,
                reviewsCount: 1
            };

            const submitBtn = document.getElementById('submitProductBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';

            try {
                const res = await fetch('http://localhost:5000/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productPayload)
                });
                const data = await res.json();

                if (res.ok || data.success) {
                    alert('✨ New creation added successfully to the catalog!');
                    addProductForm.reset();
                } else {
                    alert('Failed to add product: ' + (data.message || 'Server error'));
                }
            } catch (err) {
                console.error('Product add error:', err);
                alert('Failed to connect to backend server.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'PUBLISH TO LIVE INVENTORY';
            }
        });
    }

    /* =======================================================
   14. Contact Form Submission
======================================================= */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const messageData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };

            const submitBtn = document.getElementById('contactSubmitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Dispatching Inquiry...';

            try {
                const res = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messageData)
                });
                const data = await res.json();

                if (data.success) {
                    alert('✨ Your dispatch has been transmitted to the Atelier concierge. We will respond within 24 hours.');
                    contactForm.reset();
                } else {
                    alert('Failed to send: ' + (data.message || 'Server error'));
                }
            } catch (err) {
                console.error('Contact error:', err);
                alert('Failed to connect to the concierge server.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'DISPATCH INQUIRY';
            }
        });
    }

    /* =======================================================
       15. Admin Panel: Load Client Messages & Delete
    ======================================================= */
    const messagesTableBody = document.getElementById('messagesTableBody');
    const refreshMessagesBtn = document.getElementById('refreshMessagesBtn');

    if (messagesTableBody) {
        async function loadAdminMessages() {
            messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#a1a1aa;">Fetching inquiries...</td></tr>';

            try {
                const res = await fetch('http://localhost:5000/api/contact');
                const data = await res.json();

                if (!data.success || !data.messages || data.messages.length === 0) {
                    messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#a1a1aa;">No client inquiries received yet.</td></tr>';
                    return;
                }

                messagesTableBody.innerHTML = '';
                data.messages.forEach(msg => {
                    const msgDate = new Date(msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
                    row.innerHTML = `
                    <td style="padding: 14px 15px; color: #71717a; font-size: 0.75rem; white-space: nowrap;">${msgDate}</td>
                    <td style="padding: 14px 15px;">
                        <strong style="color: #fff;">${msg.name}</strong><br>
                        <span style="color: #a1a1aa; font-size: 0.75rem;">${msg.email}</span>
                    </td>
                    <td style="padding: 14px 15px; color: #d4af37; font-weight: 500;">${msg.subject}</td>
                    <td style="padding: 14px 15px; color: #d4d4d8; font-size: 0.8rem; line-height: 1.5;">${msg.message}</td>
                    <td style="padding: 14px 15px; text-align: right;">
                        <button class="delete-msg-btn" data-id="${msg._id}" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;
                    messagesTableBody.appendChild(row);
                });

                // Delete message event handler
                document.querySelectorAll('.delete-msg-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const id = btn.getAttribute('data-id');
                        if (confirm('Are you sure you want to delete this inquiry?')) {
                            try {
                                await fetch(`http://localhost:5000/api/contact/${id}`, { method: 'DELETE' });
                                loadAdminMessages();
                            } catch (err) {
                                alert('Failed to delete message');
                            }
                        }
                    });
                });

            } catch (err) {
                console.error('Fetch messages error:', err);
                messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#ef4444;">Failed to load messages from server.</td></tr>';
            }
        }

        if (refreshMessagesBtn) {
            refreshMessagesBtn.addEventListener('click', loadAdminMessages);
        }
        loadAdminMessages();
    }

});