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
    const productCards = document.querySelectorAll('.shop-main-section .product-card');

    if (filterButtons.length > 0 && productCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                productCards.forEach(card => {
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
});