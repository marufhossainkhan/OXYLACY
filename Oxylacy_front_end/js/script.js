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
       2. Header Search Bar & Real-Time DB Auto-Suggestion (In-Place)
    ======================================================= */
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const searchBarBox = document.getElementById('searchBarBox');
    const headerSearchInput = document.getElementById('headerSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');

    let allDbProducts = [];

    // Preload products for instant 1-3 letter search
    fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) allDbProducts = data;
        })
        .catch(err => console.error('Search cache error:', err));

    function renderSuggestions(query) {
        if (!searchSuggestions) return;
        const q = query.toLowerCase().trim();

        if (q.length === 0) {
            searchSuggestions.style.display = 'none';
            searchSuggestions.innerHTML = '';
            return;
        }

        const matches = allDbProducts.filter(p => 
            p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))
        );

        if (matches.length === 0) {
            searchSuggestions.innerHTML = '<div style="padding: 12px; color: #a1a1aa; font-size: 0.8rem; text-align: center;">No masterpieces found</div>';
            searchSuggestions.style.display = 'block';
            return;
        }

        searchSuggestions.innerHTML = '';
        matches.slice(0, 5).forEach(p => {
            const item = document.createElement('a');
            item.href = `product-details.html?id=${p.id}`;
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '10px';
            item.style.padding = '10px 12px';
            item.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
            item.style.textDecoration = 'none';
            item.style.color = '#fff';
            item.style.transition = 'background 0.2s';
            item.onmouseover = () => item.style.background = 'rgba(212,175,55,0.1)';
            item.onmouseout = () => item.style.background = 'transparent';

            item.innerHTML = `
                <img src="${p.image}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15);">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                    <div style="font-size: 0.75rem; color: #d4af37;">$${Number(p.price).toFixed(2)}</div>
                </div>
            `;
            searchSuggestions.appendChild(item);
        });

        searchSuggestions.style.display = 'block';
    }

    if (headerSearchBtn && searchBarBox && headerSearchInput) {
        // ক্লিক করলে আইকন লুকিয়ে যাবে এবং সার্চ বক্স আসবে (মেনু কোনো নড়াচড়া করবে না)
        headerSearchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerSearchBtn.style.display = 'none';
            searchBarBox.style.display = 'flex';
            headerSearchInput.focus();
        });

        // ক্রস (X) এ ক্লিক করলে সার্চ বক্স চলে গিয়ে আবার আইকন ফিরে আসবে
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                headerSearchInput.value = '';
                if (searchSuggestions) searchSuggestions.style.display = 'none';
                searchBarBox.style.display = 'none';
                headerSearchBtn.style.display = 'flex';
            });
        }

        // লাইভ ১-৩ অক্ষরের ইনপুট সাজেশন
        headerSearchInput.addEventListener('input', (e) => {
            renderSuggestions(e.target.value);
        });

        // এন্টার চাপলে সরাসরি শপ পেজে সার্চ
        headerSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = headerSearchInput.value.trim();
                if (q) {
                    window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
                }
            }
        });

        // বাইরে ক্লিক করলে সার্চ বক্স বন্ধ হয়ে আইকন চলে আসবে
        document.addEventListener('click', (e) => {
            if (!searchBarBox.contains(e.target) && e.target !== headerSearchBtn) {
                if (searchSuggestions) searchSuggestions.style.display = 'none';
                searchBarBox.style.display = 'none';
                headerSearchBtn.style.display = 'flex';
            }
        });
    }

    /* =======================================================
       3. Centralized Filter Logic (Universal & Exact Matching)
    ======================================================= */
    function applyFilter(filterValue) {
        const normalizedFilter = (filterValue || 'all').toLowerCase().replace(/[^a-z0-9]/g, '');

        // Update active button UI
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(b => {
            const btnFilter = (b.getAttribute('data-filter') || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (btnFilter === normalizedFilter) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        // Filter products
        const currentProductCards = document.querySelectorAll('.shop-main-section .products-grid .product-card');

        currentProductCards.forEach(card => {
            const cardCategory = (card.getAttribute('data-category') || '').toLowerCase().replace(/[^a-z0-9]/g, '');

            if (normalizedFilter === 'all') {
                card.style.display = 'flex';
            } else if (cardCategory === normalizedFilter || cardCategory.includes(normalizedFilter) || normalizedFilter.includes(cardCategory)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function applySearchFilter(query) {
        const lowerQ = query.toLowerCase().trim();
        const currentProductCards = document.querySelectorAll('.shop-main-section .products-grid .product-card');

        // Deactivate category buttons to indicate a custom search query
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(b => b.classList.remove('active'));

        currentProductCards.forEach(card => {
            const title = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
            const category = (card.getAttribute('data-category') || '').toLowerCase();

            if (title.includes(lowerQ) || category.includes(lowerQ)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function checkAndApplyUrlFilter() {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('category');
        const searchParam = urlParams.get('search');

        if (searchParam) {
            if (headerSearchInput) {
                headerSearchInput.style.display = 'inline-block';
                headerSearchInput.value = searchParam;
            }
            applySearchFilter(searchParam);
        } else if (catParam) {
            applyFilter(catParam.toLowerCase().trim());
        }
    }

    /* =======================================================
       4. Dynamic Shop Initialization (Categories + Products)
    ======================================================= */
    const shopGrid = document.querySelector('.shop-main-section .products-grid');
    const filterButtonsContainer = document.querySelector('.shop-main-section .filter-buttons');

    if (shopGrid && filterButtonsContainer) {
        async function initShopPage() {
            try {
                // 1. Fetch & Render Categories
                const catRes = await fetch('http://localhost:5000/api/categories');
                const categories = await catRes.json();

                filterButtonsContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All Creations</button>';
                if (Array.isArray(categories)) {
                    categories.forEach(cat => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-btn';
                        btn.setAttribute('data-filter', (cat.slug || cat.name).toLowerCase());
                        btn.textContent = cat.name;
                        btn.onclick = () => applyFilter((cat.slug || cat.name).toLowerCase());
                        filterButtonsContainer.appendChild(btn);
                    });
                }

                // Default 'All Creations' button click handler
                const allBtn = filterButtonsContainer.querySelector('[data-filter="all"]');
                if (allBtn) {
                    allBtn.onclick = () => applyFilter('all');
                }

                // 2. Fetch & Render Products
                const prodRes = await fetch('http://localhost:5000/api/products');
                const products = await prodRes.json();

                if (Array.isArray(products) && products.length > 0) {
                    shopGrid.innerHTML = '';
                    products.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'product-card';
                        card.setAttribute('data-category', (item.category || '').toLowerCase());

                        card.innerHTML = `
                            <div class="product-img-box">
                                <img src="${item.image}" alt="${item.name}" class="product-img">
                                ${item.tag ? `<span class="product-badge">${item.tag}</span>` : ''}
                            </div>
                            <div class="product-info">
                                <span class="product-category">${item.category}</span>
                                <h3 class="product-name">${item.name}</h3>
                                <p class="product-price">$${Number(item.price).toFixed(2)} ${item.originalPrice ? `<span class="old-price" style="text-decoration: line-through; opacity: 0.6; margin-left: 6px;">$${Number(item.originalPrice).toFixed(2)}</span>` : ''}</p>
                                <a href="product-details.html?id=${item.id}" class="btn-product">View Details</a>
                            </div>
                        `;
                        shopGrid.appendChild(card);
                    });
                }

                // 3. Apply URL Filter/Search now that DOM is 100% ready
                checkAndApplyUrlFilter();

            } catch (err) {
                console.error('Error initializing shop:', err);
            }
        }

        initShopPage();
    }

    /* =======================================================
       5. Product Details Page: Variant Selector
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
       6. Dynamic Single Product Details Page
    ======================================================= */
    const detailsSection = document.querySelector('.product-details-section');

    if (detailsSection) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            fetch(`http://localhost:5000/api/products/${productId}`)
                .then(res => res.json())
                .then(product => {
                    if (product && product.id) {
                        document.title = `${product.name} — OXYLACY`;

                        const breadcrumb = document.querySelector('.breadcrumb');
                        if (breadcrumb) {
                            breadcrumb.innerHTML = `
                                <a href="index.html">Home</a> / 
                                <a href="shop.html">${(product.category || 'Catalog').toUpperCase()}</a> / 
                                <span>${product.name}</span>
                            `;
                        }

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

                        const categorySubtitle = document.querySelector('.product-summary .section-subtitle');
                        if (categorySubtitle) {
                            categorySubtitle.textContent = `${(product.category || 'Luxury').toUpperCase()} COLLECTION`;
                        }

                        const detailsTitle = document.querySelector('.details-title');
                        if (detailsTitle) {
                            detailsTitle.textContent = product.name;
                        }

                        const detailsPrice = document.querySelector('.details-price');
                        if (detailsPrice) {
                            detailsPrice.innerHTML = `$${Number(product.price).toFixed(2)} ${product.originalPrice ? `<span style="font-size: 0.6em; text-decoration: line-through; opacity: 0.6; margin-left: 8px;">$${Number(product.originalPrice).toFixed(2)}</span>` : ''}`;
                        }

                        const detailsDesc = document.querySelector('.details-description');
                        if (detailsDesc) {
                            detailsDesc.textContent = product.description;
                        }
                    }
                })
                .catch(err => console.error('Error loading product details:', err));
        }
    }

    /* =======================================================
       7. Cart Management (Local Storage)
    ======================================================= */
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');

        cartCountElements.forEach(el => {
            el.textContent = totalCount;
        });
    }

    function addToCart(product, quantity = 1) {
        let cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];

        const existingIndex = cart.findIndex(item => String(item.id) === String(product.id));
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.image,
                quantity: quantity
            });
        }

        localStorage.setItem('oxylacy_cart', JSON.stringify(cart));
        updateCartCount();
        alert(`✨ ${product.name} has been added to your Atelier Bag!`);
    }

    updateCartCount();

    const addToCartDetailsBtn = document.querySelector('.add-to-cart-action');
    if (addToCartDetailsBtn) {
        addToCartDetailsBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            const title = document.querySelector('.details-title')?.textContent || 'Luxury Product';
            const priceText = document.querySelector('.details-price')?.textContent || '$0';
            const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
            const img = document.getElementById('mainProductImg')?.getAttribute('src') || '';
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
       8. Dynamic Cart Page Rendering
    ======================================================= */
    const cartItemsContainer = document.querySelector('.cart-items-container');

    if (cartItemsContainer) {
        function renderCartPage() {
            const cart = JSON.parse(localStorage.getItem('oxylacy_cart')) || [];
            const actionsRow = document.querySelector('.cart-actions-row');

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
                            <span class="item-unit-price">$${Number(item.price).toFixed(2)}</span>
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

        renderCartPage();
    }

    /* =======================================================
       9. Dynamic Featured Products for Homepage (index.html)
    ======================================================= */
    const featuredSection = document.querySelector('.featured-products-section .products-grid');

    if (featuredSection) {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(products => {
                if (products && Array.isArray(products) && products.length > 0) {
                    const displayProducts = products.slice(0, 6);
                    featuredSection.innerHTML = '';

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
                                <p class="product-price">$${Number(product.price).toFixed(2)} ${product.originalPrice ? `<span style="font-size: 0.85em; text-decoration: line-through; opacity: 0.6; margin-left: 6px;">$${Number(product.originalPrice).toFixed(2)}</span>` : ''}</p>
                                <a href="product-details.html?id=${product.id}" class="btn-product">View Details</a>
                            </div>
                        `;
                        featuredSection.appendChild(card);
                    });
                }
            })
            .catch(err => console.error('Error loading featured products on homepage:', err));
    }

    /* =======================================================
       10. Checkout Form & Order Submission
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
                            <div style="color: #a1a1aa; font-size: 0.75rem;">Qty: ${item.quantity} × $${Number(item.price).toFixed(2)}</div>
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

        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('Your bag is empty! Please add products before placing an order.');
                return;
            }

            const orderData = {
                orderId: 'OXY-' + Math.floor(100000 + Math.random() * 900000),
                customerName: document.getElementById('custName')?.value || 'Guest',
                email: document.getElementById('custEmail')?.value || '',
                phone: document.getElementById('custPhone')?.value || '',
                address: `${document.getElementById('custAddress')?.value || ''}, ${document.getElementById('custCity')?.value || ''}, ${document.getElementById('custCountry')?.value || ''}`,
                items: cart,
                totalAmount: grandTotal,
                paymentMethod: 'Cash on Delivery',
                status: 'Pending'
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
                    alert('✨ Congratulations! Your order has been placed successfully.\nOrder ID: #' + (data.order.orderId || data.order.id));
                    window.location.href = 'index.html';
                } else {
                    alert('Order placement failed: ' + (data.error || 'Server error'));
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
       11. Contact Form Submission
    ======================================================= */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const messageData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject')?.value || 'Inquiry',
                message: document.getElementById('contactMessage').value
            };

            const submitBtn = document.getElementById('contactSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Dispatching Inquiry...';
            }

            try {
                const res = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messageData)
                });
                const data = await res.json();

                if (data.success) {
                    alert('✨ Your dispatch has been transmitted to the Atelier concierge.');
                    contactForm.reset();
                } else {
                    alert('Failed to send message: ' + (data.error || 'Server error'));
                }
            } catch (err) {
                console.error('Contact error:', err);
                alert('Failed to connect to the concierge server.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'DISPATCH INQUIRY';
                }
            }
        });
    }

    /* =======================================================
       12. Admin Panel Logic
    ======================================================= */
    const ordersTableBody = document.getElementById('ordersTableBody');
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    const addProductForm = document.getElementById('addProductForm');
    const messagesTableBody = document.getElementById('messagesTableBody');
    const refreshMessagesBtn = document.getElementById('refreshMessagesBtn');
    const addCategoryForm = document.getElementById('addCategoryForm');
    const categoryListContainer = document.getElementById('categoryListContainer');
    const pCategorySelect = document.getElementById('pCategory');
    const productsTableBody = document.getElementById('productsTableBody');
    const refreshProductsBtn = document.getElementById('refreshProductsBtn');
    const editProductModal = document.getElementById('editProductModal');
    const editProductForm = document.getElementById('editProductForm');
    const editPCategorySelect = document.getElementById('editPCategory');

    // Admin: Categories Management
    async function loadAdminCategories() {
        if (!categoryListContainer && !pCategorySelect) return;

        try {
            const res = await fetch('http://localhost:5000/api/categories');
            const categories = await res.json();

            if (pCategorySelect) {
                pCategorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
            }
            if (editPCategorySelect) {
                editPCategorySelect.innerHTML = '';
            }
            if (categoryListContainer) {
                categoryListContainer.innerHTML = '';
            }

            if (Array.isArray(categories) && categories.length > 0) {
                categories.forEach(cat => {
                    if (pCategorySelect) {
                        const opt = document.createElement('option');
                        opt.value = cat.name;
                        opt.textContent = cat.name;
                        pCategorySelect.appendChild(opt);
                    }
                    if (editPCategorySelect) {
                        const opt = document.createElement('option');
                        opt.value = cat.name;
                        opt.textContent = cat.name;
                        editPCategorySelect.appendChild(opt);
                    }

                    if (categoryListContainer) {
                        const tag = document.createElement('div');
                        tag.style.display = 'inline-flex';
                        tag.style.alignItems = 'center';
                        tag.style.gap = '8px';
                        tag.style.background = 'rgba(212, 175, 55, 0.1)';
                        tag.style.border = '1px solid rgba(212, 175, 55, 0.3)';
                        tag.style.color = '#d4af37';
                        tag.style.padding = '5px 12px';
                        tag.style.borderRadius = '3px';
                        tag.style.fontSize = '0.8rem';

                        tag.innerHTML = `
                            <span>${cat.name}</span>
                            <i class="fa-solid fa-xmark delete-cat-btn" data-id="${cat.id}" style="cursor: pointer; opacity: 0.7;" title="Delete category"></i>
                        `;
                        categoryListContainer.appendChild(tag);
                    }
                });

                document.querySelectorAll('.delete-cat-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const catId = btn.getAttribute('data-id');
                        if (confirm('Are you sure you want to remove this category?')) {
                            try {
                                await fetch(`http://localhost:5000/api/categories/${catId}`, { method: 'DELETE' });
                                loadAdminCategories();
                            } catch (err) {
                                alert('Failed to delete category.');
                            }
                        }
                    });
                });

            } else if (categoryListContainer) {
                categoryListContainer.innerHTML = '<span style="color: #71717a; font-size: 0.8rem;">No categories found.</span>';
            }
        } catch (err) {
            console.error('Error fetching admin categories:', err);
        }
    }

    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const catNameInput = document.getElementById('catNameInput');
            const name = catNameInput.value.trim();

            if (!name) return;

            try {
                const res = await fetch('http://localhost:5000/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    alert(`✨ Category "${name}" created successfully!`);
                    catNameInput.value = '';
                    loadAdminCategories();
                } else {
                    alert('Error creating category: ' + (data.error || 'Duplicate or invalid name'));
                }
            } catch (err) {
                console.error('Category creation error:', err);
                alert('Failed to connect to backend server.');
            }
        });
    }

    loadAdminCategories();

    // Admin: Product Inventory List, Edit & Delete
    async function loadAdminProducts() {
        if (!productsTableBody) return;
        productsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#a1a1aa;">Fetching Live Inventory...</td></tr>';

        try {
            const res = await fetch('http://localhost:5000/api/products');
            const products = await res.json();

            if (!Array.isArray(products) || products.length === 0) {
                productsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#a1a1aa;">No creations found in inventory.</td></tr>';
                if (document.getElementById('statTotalProducts')) document.getElementById('statTotalProducts').textContent = '0';
                return;
            }

            if (document.getElementById('statTotalProducts')) document.getElementById('statTotalProducts').textContent = products.length;
            productsTableBody.innerHTML = '';

            products.forEach(p => {
                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
                row.innerHTML = `
                    <td style="padding: 14px 15px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${p.image}" alt="${p.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                            <div>
                                <strong style="color: #fff; font-size: 0.9rem;">${p.name}</strong><br>
                                <span style="color: #71717a; font-size: 0.75rem;">ID: #${p.id}</span>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 14px 15px; color: #d4d4d8;">${p.category}</td>
                    <td style="padding: 14px 15px; color: #d4af37; font-weight: 600;">
                        $${Number(p.price).toFixed(2)}
                        ${p.originalPrice ? `<span style="font-size: 0.75rem; color: #71717a; text-decoration: line-through; margin-left: 5px;">$${Number(p.originalPrice).toFixed(2)}</span>` : ''}
                    </td>
                    <td style="padding: 14px 15px;">
                        ${p.tag ? `<span style="background: rgba(212,175,55,0.15); color: #d4af37; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem;">${p.tag}</span>` : '<span style="color: #71717a; font-size: 0.75rem;">None</span>'}
                    </td>
                    <td style="padding: 14px 15px; text-align: right; white-space: nowrap;">
                        <button class="edit-prod-btn" data-id="${p.id}" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 0.75rem; margin-right: 6px;">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="delete-prod-btn" data-id="${p.id}" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;
                productsTableBody.appendChild(row);
            });

            // Attach Delete Event
            document.querySelectorAll('.delete-prod-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (confirm('Are you sure you want to permanently delete this creation?')) {
                        try {
                            await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
                            alert('Product removed from catalog.');
                            loadAdminProducts();
                        } catch (err) {
                            alert('Failed to delete product.');
                        }
                    }
                });
            });

            // Attach Edit Event (Open Modal)
            document.querySelectorAll('.edit-prod-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    try {
                        const res = await fetch(`http://localhost:5000/api/products/${id}`);
                        const p = await res.json();

                        if (p && p.id) {
                            document.getElementById('editPId').value = p.id;
                            document.getElementById('editPName').value = p.name;
                            document.getElementById('editPCategory').value = p.category;
                            document.getElementById('editPPrice').value = p.price;
                            document.getElementById('editPOriginalPrice').value = p.originalPrice || '';
                            document.getElementById('editPTag').value = p.tag || '';
                            document.getElementById('editPImage').value = p.image;
                            document.getElementById('editPDescription').value = p.description || '';

                            editProductModal.style.display = 'flex';
                        }
                    } catch (err) {
                        alert('Failed to load product details for editing.');
                    }
                });
            });

        } catch (err) {
            console.error('Error fetching admin products:', err);
            productsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#ef4444;">Failed to load products from server.</td></tr>';
        }
    }

    if (refreshProductsBtn) refreshProductsBtn.addEventListener('click', loadAdminProducts);
    loadAdminProducts();

    // Close Modal Events
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const cancelEditModalBtn = document.getElementById('cancelEditModalBtn');
    if (closeEditModalBtn) closeEditModalBtn.onclick = () => editProductModal.style.display = 'none';
    if (cancelEditModalBtn) cancelEditModalBtn.onclick = () => editProductModal.style.display = 'none';

    // Submit Edit Form
    if (editProductForm) {
        editProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editPId').value;

            const payload = {
                name: document.getElementById('editPName').value,
                category: document.getElementById('editPCategory').value,
                price: parseFloat(document.getElementById('editPPrice').value),
                originalPrice: document.getElementById('editPOriginalPrice').value ? parseFloat(document.getElementById('editPOriginalPrice').value) : null,
                tag: document.getElementById('editPTag').value || '',
                image: document.getElementById('editPImage').value,
                description: document.getElementById('editPDescription').value
            };

            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    alert('✨ Product updated successfully!');
                    editProductModal.style.display = 'none';
                    loadAdminProducts();
                } else {
                    alert('Update failed: ' + (data.error || 'Server error'));
                }
            } catch (err) {
                console.error('Product update error:', err);
                alert('Failed to connect to backend server.');
            }
        });
    }

    // Admin: Orders Manifest
    if (ordersTableBody) {
        async function loadAdminOrders() {
            ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#a1a1aa;">Fetching Atelier Orders...</td></tr>';

            try {
                const res = await fetch('http://localhost:5000/api/orders');
                const data = await res.json();
                const orders = Array.isArray(data) ? data : (data.orders || []);

                if (orders.length === 0) {
                    ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#a1a1aa;">No acquisition records found.</td></tr>';
                    if (document.getElementById('statTotalOrders')) document.getElementById('statTotalOrders').textContent = '0';
                    if (document.getElementById('statTotalRevenue')) document.getElementById('statTotalRevenue').textContent = '$0.00';
                    if (document.getElementById('statPendingOrders')) document.getElementById('statPendingOrders').textContent = '0';
                    return;
                }

                let totalRev = 0;
                let pendingCount = 0;
                ordersTableBody.innerHTML = '';

                orders.forEach(order => {
                    totalRev += (Number(order.totalAmount) || 0);
                    if (order.status === 'Pending') pendingCount++;

                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    let itemsSummary = '';
                    if (Array.isArray(order.items)) {
                        itemsSummary = order.items.map(i => `${i.name} (×${i.quantity})`).join('<br>');
                    } else if (typeof order.items === 'string') {
                        try {
                            const parsed = JSON.parse(order.items);
                            itemsSummary = Array.isArray(parsed) ? parsed.map(i => `${i.name} (×${i.quantity})`).join('<br>') : order.items;
                        } catch (e) {
                            itemsSummary = order.items;
                        }
                    }

                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
                    row.innerHTML = `
                        <td style="padding: 16px 15px;">
                            <span style="color: #d4af37; font-weight: 600; font-size: 0.8rem;">#${order.orderId || order.id}</span><br>
                            <span style="color: #71717a; font-size: 0.75rem;">${orderDate}</span>
                        </td>
                        <td style="padding: 16px 15px;">
                            <strong style="color: #fff;">${order.customerName || 'N/A'}</strong><br>
                            <span style="color: #a1a1aa; font-size: 0.75rem;">${order.email || ''}</span><br>
                            <span style="color: #71717a; font-size: 0.75rem;">${order.address || ''}</span>
                        </td>
                        <td style="padding: 16px 15px; font-size: 0.8rem; color: #d4d4d8;">
                            ${itemsSummary || 'N/A'}
                        </td>
                        <td style="padding: 16px 15px; color: #d4af37; font-weight: 600;">
                            $${Number(order.totalAmount || 0).toFixed(2)}
                        </td>
                        <td style="padding: 16px 15px;">
                            <select class="status-select" data-id="${order.id}" style="background: #18181b; color: #e4e4e7; border: 1px solid rgba(255,255,255,0.2); padding: 5px 8px; border-radius: 3px; font-size: 0.75rem;">
                                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            </select>
                        </td>
                        <td style="padding: 16px 15px; text-align: right;">
                            <button class="delete-order-btn" data-id="${order.id}" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    `;
                    ordersTableBody.appendChild(row);
                });

                if (document.getElementById('statTotalOrders')) document.getElementById('statTotalOrders').textContent = orders.length;
                if (document.getElementById('statTotalRevenue')) document.getElementById('statTotalRevenue').textContent = `$${totalRev.toFixed(2)}`;
                if (document.getElementById('statPendingOrders')) document.getElementById('statPendingOrders').textContent = pendingCount;

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

                document.querySelectorAll('.delete-order-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
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

        if (refreshOrdersBtn) refreshOrdersBtn.addEventListener('click', loadAdminOrders);
        loadAdminOrders();
    }

    // Add New Product
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
                description: document.getElementById('pDescription').value
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
                    loadAdminProducts();
                } else {
                    alert('Failed to add product: ' + (data.message || data.error || 'Server error'));
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

    // Load Messages
    if (messagesTableBody) {
        async function loadAdminMessages() {
            messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#a1a1aa;">Fetching inquiries...</td></tr>';

            try {
                const res = await fetch('http://localhost:5000/api/contact');
                const data = await res.json();
                const messages = Array.isArray(data) ? data : (data.messages || []);

                if (messages.length === 0) {
                    messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#a1a1aa;">No client inquiries received yet.</td></tr>';
                    return;
                }

                messagesTableBody.innerHTML = '';
                messages.forEach(msg => {
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
                        <td style="padding: 14px 15px; color: #d4af37; font-weight: 500;">${msg.subject || 'Inquiry'}</td>
                        <td style="padding: 14px 15px; color: #d4d4d8; font-size: 0.8rem; line-height: 1.5;">${msg.message}</td>
                        <td style="padding: 14px 15px; text-align: right;">
                            <button class="delete-msg-btn" data-id="${msg.id}" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    `;
                    messagesTableBody.appendChild(row);
                });

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

        if (refreshMessagesBtn) refreshMessagesBtn.addEventListener('click', loadAdminMessages);
        loadAdminMessages();
    }

});