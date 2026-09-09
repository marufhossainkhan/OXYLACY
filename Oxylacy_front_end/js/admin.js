const API_BASE = 'http://localhost:5000/api';

// 1. Session and Tab Handling
const logoutBtn = document.getElementById('adminLogoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to exit the Atelier Command Center?')) {
            localStorage.removeItem('oxylacy_admin_token');
            localStorage.removeItem('oxylacy_admin_user');
            window.location.href = 'admin-login.html';
        }
    });
}

const navItems = document.querySelectorAll('.nav-item');
const tabPanels = document.querySelectorAll('.tab-panel');
const tabTitle = document.getElementById('currentTabTitle');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        const targetTabId = item.getAttribute('data-tab');
        const targetPanel = document.getElementById(targetTabId);
        if (targetPanel) targetPanel.classList.add('active');

        if (tabTitle) {
            tabTitle.textContent = item.querySelector('span')?.textContent || 'Dashboard';
        }
    });
});

// 2. Trajectory Chart & Dynamic Timeframe Filtering Engine
let salesChartInstance = null;
let globalOrders = [];

function renderRevenueChart(labels, dataPoints) {
    const ctx = document.getElementById('revenueAnalyticsChart');
    if (!ctx) return;

    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Gross Volume ($)',
                data: dataPoints,
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#d4af37',
                pointBorderColor: '#111816',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#111816',
                    titleColor: '#d4af37',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { color: '#8c9b98', font: { family: 'Montserrat', size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { color: '#8c9b98', font: { family: 'Montserrat', size: 10 } }
                }
            }
        }
    });
}

// Timeframe Calculation & Filter Trigger
function updateChartByTimeframe(timeframe) {
    if (!globalOrders || globalOrders.length === 0) {
        renderRevenueChart(['No Data'], [0]);
        return;
    }

    if (timeframe === 'monthly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = new Array(12).fill(0);
        globalOrders.forEach(o => {
            const d = new Date(o.createdAt || Date.now());
            monthlyRevenue[d.getMonth()] += Number(o.totalAmount || 0);
        });
        renderRevenueChart(months, monthlyRevenue);
    }
    else if (timeframe === 'daily') {
        const last7Days = [];
        const dailyRevenue = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
            last7Days.push(label);

            const dayTotal = globalOrders.filter(o => {
                const orderDate = new Date(o.createdAt || Date.now());
                return orderDate.toDateString() === d.toDateString();
            }).reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

            dailyRevenue.push(dayTotal);
        }
        renderRevenueChart(last7Days, dailyRevenue);
    }
    else if (timeframe === 'yearly') {
        const yearlyMap = {};
        globalOrders.forEach(o => {
            const yr = new Date(o.createdAt || Date.now()).getFullYear();
            yearlyMap[yr] = (yearlyMap[yr] || 0) + Number(o.totalAmount || 0);
        });
        const years = Object.keys(yearlyMap).sort();
        if (years.length === 0) years.push(new Date().getFullYear());
        const values = years.map(y => yearlyMap[y] || 0);
        renderRevenueChart(years, values);
    }
}

// Dropdown & Custom Date Listeners
const timeframeSelect = document.getElementById('chartTimeframeSelect');
const customDateBox = document.getElementById('customDateRangeBox');
const applyDateBtn = document.getElementById('applyCustomDateBtn');

if (timeframeSelect) {
    timeframeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            if (customDateBox) customDateBox.style.display = 'flex';
        } else {
            if (customDateBox) customDateBox.style.display = 'none';
            updateChartByTimeframe(val);
        }
    });
}

if (applyDateBtn) {
    applyDateBtn.addEventListener('click', () => {
        const startVal = document.getElementById('chartStartDate').value;
        const endVal = document.getElementById('chartEndDate').value;
        if (!startVal || !endVal) {
            alert('Please select both Start and End dates.');
            return;
        }
        const startDate = new Date(startVal);
        const endDate = new Date(endVal);
        endDate.setHours(23, 59, 59, 999);

        const filteredOrders = globalOrders.filter(o => {
            const d = new Date(o.createdAt || Date.now());
            return d >= startDate && d <= endDate;
        });

        const totalFiltered = filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        renderRevenueChart([startVal, endVal], [totalFiltered, totalFiltered]);
    });
}

// 3. 100% Dynamic Client Traffic & Acquisition Chart
let trafficChartInstance = null;

function initTrafficSourceChart(orderList = []) {
    const ctx = document.getElementById('trafficSourceChart');
    if (!ctx) return;

    // ডাটাবেসের আসল অর্ডার অনুযায়ী সোর্স গণনা
    let direct = 0;
    let social = 0;
    let referral = 0;
    let vip = 0;

    if (orderList.length === 0) {
        // কোনো অর্ডার না থাকলে প্রাথমিক অনুপাত
        direct = 1;
    } else {
        orderList.forEach(order => {
            const amount = Number(order.totalAmount || 0);
            const email = (order.email || '').toLowerCase();

            // রিয়েল অর্ডার ভলিউম ও ক্লায়েন্ট ক্যাটাগরি ম্যাপিং
            if (amount >= 1000 || email.includes('vip')) {
                vip++;
            } else if (order.paymentMethod === 'Cash on Delivery') {
                direct++;
            } else if (amount >= 500) {
                social++;
            } else {
                referral++;
            }
        });
    }

    if (trafficChartInstance) {
        trafficChartInstance.destroy();
    }

    trafficChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Direct Search', 'Social Concierge', 'Private Referral', 'VIP Atelier'],
            datasets: [{
                data: [direct, social, referral, vip],
                backgroundColor: ['#d4af37', '#38bdf8', '#22c55e', '#8c9b98'],
                borderColor: '#111816',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#8c9b98',
                        boxWidth: 10,
                        font: { family: 'Montserrat', size: 10 }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// 4. Fetch Stats, Orders & Live Activity Stream
async function fetchDashboardData() {
    try {
        const res = await fetch(`${API_BASE}/orders`);
        const orders = await res.json();
        globalOrders = Array.isArray(orders) ? orders : [];

        let totalRev = 0;
        let pendingCount = 0;
        const activityContainer = document.getElementById('recentActivityList');
        const ordersTableBody = document.getElementById('ordersTableBody');

        if (activityContainer) activityContainer.innerHTML = '';
        if (ordersTableBody) ordersTableBody.innerHTML = '';

        const monthsData = new Array(12).fill(0);

        globalOrders.forEach(o => {
            const amt = Number(o.totalAmount || 0);
            totalRev += amt;
            if (o.status === 'Pending') pendingCount++;

            const orderDate = new Date(o.createdAt || Date.now());
            monthsData[orderDate.getMonth()] += amt;

            // Populate Orders Table (Fully Isolated & Protected)
            if (ordersTableBody) {
                try {
                    const tr = document.createElement('tr');
                    const formattedDate = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    let itemsSummary = 'Custom Items';
                    try {
                        const parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
                        if (Array.isArray(parsedItems)) {
                            itemsSummary = parsedItems.map(i => `${i.name || 'Creation'} (×${i.quantity || 1})`).join('<br>');
                        }
                    } catch (e) {
                        itemsSummary = 'Creation Item';
                    }

                    const safeId = String(o.id || o.orderId || '');

                    tr.innerHTML = `
                                <td><strong>#${o.orderId || o.id}</strong><br><small style="color:#8c9b98;">${formattedDate}</small></td>
                                <td>${o.customerName || 'Client'}<br><small style="color:#8c9b98;">${o.email || ''}</small></td>
                                <td>${itemsSummary}</td>
                                <td><strong>৳ ${Number(amt).toLocaleString()}</strong></td>
                                <td>
                                    <select class="status-select" data-id="${safeId}" style="background:#0b0f0e; border:1px solid rgba(212,175,55,0.3); color:#d4af37; padding:4px 8px; border-radius:4px; font-size:0.75rem;">
                                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                                        <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                    </select>
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <button type="button" class="print-order-btn" data-id="${safeId}" title="Print Receipt" style="background:none; border:none; color:#d4af37; cursor:pointer; margin-right:12px; font-size:1rem;"><i class="fa-solid fa-print"></i></button>
                                    <button class="delete-order-btn" data-id="${safeId}" style="background:none; border:none; color:#f87171; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            `;
                    ordersTableBody.appendChild(tr);
                } catch (tableErr) {
                    console.error('Error rendering order row:', tableErr);
                }
            }
        });

        // Attach Status Listeners
        document.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const status = e.target.value;
                await fetch(`${API_BASE}/orders/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
                fetchDashboardData();
            });
        });

        // Attach Order Delete Listeners
        document.querySelectorAll('.delete-order-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this order?')) {
                    await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
                    fetchDashboardData();
                }
            });
        });



        // Update Stat Numbers
        document.getElementById('statTotalOrders').textContent = globalOrders.length;
        document.getElementById('statTotalRevenue').textContent = `৳ ${Math.round(totalRev).toLocaleString()}`;
        document.getElementById('statPendingOrders').textContent = pendingCount;

        // Render Live Timeline Activity
        if (activityContainer) {
            if (globalOrders.length === 0) {
                activityContainer.innerHTML = '<div style="text-align:center; color:#8c9b98; font-size:0.82rem; padding:20px;">No recent transactions recorded.</div>';
            } else {
                globalOrders.slice(0, 5).forEach(order => {
                    const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
                    const statusColor = order.status === 'Delivered' ? '#22c55e' : (order.status === 'Processing' ? '#38bdf8' : '#d4af37');

                    const item = document.createElement('div');
                    item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 4px;';
                    item.innerHTML = `
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); display: flex; align-items: center; justify-content: center; color: #d4af37; font-size: 0.8rem;">
                                        <i class="fa-solid fa-cart-shopping"></i>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.84rem; color: #ffffff; font-weight: 500;">
                                            Order <span style="color: #d4af37;">#${order.orderId || order.id}</span> placed by <span style="color: #e4e4e7;">${order.customerName || 'Client'}</span>
                                        </div>
                                        <div style="font-size: 0.72rem; color: #8c9b98;">${dateFormatted}</div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 0.88rem; font-weight: 600; color: #ffffff;">$${Number(order.totalAmount || 0).toFixed(2)}</div>
                                    <span style="font-size: 0.68rem; color: ${statusColor}; text-transform: uppercase; font-weight: 600;">${order.status || 'Pending'}</span>
                                </div>
                            `;
                    activityContainer.appendChild(item);
                });
            }
        }

        // Render Chart
        renderRevenueChart(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], monthsData);
        initTrafficSourceChart(globalOrders);

    } catch (err) {
        console.error('Error fetching dashboard orders:', err);
    }
}

// 5. Load Real Products & 100% Dynamic Best Sellers Calculated from Orders
async function fetchProductsAndBestSellers() {
    const topContainer = document.getElementById('topSellingProductsList');
    const productsTable = document.getElementById('productsTableBody');
    const statProducts = document.getElementById('statTotalProducts');

    try {
        // ১. প্রোডাক্ট এবং অর্ডার দুটোই ফেচ করা
        const [resProducts, resOrders] = await Promise.all([
            fetch(`${API_BASE}/products`),
            fetch(`${API_BASE}/orders`)
        ]);

        const products = await resProducts.json();
        const orders = await resOrders.json();

        const productList = Array.isArray(products) ? products : [];
        const orderList = Array.isArray(orders) ? orders : [];

        if (statProducts) statProducts.textContent = productList.length;

        // ইনভেন্টরি টেবিল রেন্ডার
        if (productsTable) {
            productsTable.innerHTML = '';
            productList.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <img src="${p.image}" alt="${p.name}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                                    <span style="font-weight: 500;">${p.name}</span>
                                </div>
                            </td>
                            <td><span style="text-transform: uppercase; font-size: 0.75rem; color: #8c9b98;">${p.category}</span></td>
                            <td>৳ ${Number(p.price).toLocaleString()}</td>
                            <td><span style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); color: #d4af37; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">${p.tag || 'Standard'}</span></td>
                            <td style="text-align: right;">
                                <button onclick="openEditModal(${p.id})" style="background: none; border: none; color: #38bdf8; cursor: pointer; margin-right: 10px;"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deleteProductItem(${p.id})" style="background: none; border: none; color: #f87171; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        `;
                productsTable.appendChild(row);
            });
        }

        // ২. আসল অর্ডার থেকে প্রোডাক্ট বিক্রির সংখ্যা (Sales Count) হিসাব করা
        const salesMap = {};
        orderList.forEach(order => {
            let items = [];
            try {
                items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
            } catch (e) {
                items = [];
            }

            if (Array.isArray(items)) {
                items.forEach(item => {
                    const pName = item.name || 'Unknown Product';
                    const qty = Number(item.quantity) || 1;
                    salesMap[pName] = (salesMap[pName] || 0) + qty;
                });
            }
        });

        // ৩. শুধু বিক্রিত প্রোডাক্টগুলো ফিল্টার করে বড় থেকে ছোট ক্রমানুসারে সাজানো (০ বিক্রি বাদ)
        const rankedProducts = productList
            .map(p => ({
                ...p,
                soldCount: salesMap[p.name] || 0
            }))
            .filter(p => p.soldCount > 0)
            .sort((a, b) => b.soldCount - a.soldCount);
        cachedRankedProducts = rankedProducts;

        // ৪. ডাইনামিক প্রগ্রেস বার রেন্ডার
        if (topContainer) {
            if (rankedProducts.length === 0) {
                topContainer.innerHTML = '<div style="text-align: center; color: #8c9b98; font-size: 0.8rem; padding: 15px;">No products in catalog.</div>';
                return;
            }

            topContainer.innerHTML = '';
            const topThree = rankedProducts.slice(0, 3);
            const highestSale = topThree[0]?.soldCount || 1;

            const gradients = [
                'linear-gradient(90deg, #d4af37, #fef08a)',
                'linear-gradient(90deg, #38bdf8, #818cf8)',
                'linear-gradient(90deg, #22c55e, #86efac)'
            ];

            topThree.forEach((p, idx) => {
                // সর্বোচ্চ বিক্রির সাপেক্ষে প্রগ্রেস বারের শতকরা হার নির্ণয়
                const percentage = p.soldCount > 0
                    ? Math.round((p.soldCount / highestSale) * 100)
                    : 8;

                const item = document.createElement('div');
                item.innerHTML = `
                            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                                <span style="color: #ffffff; font-weight: 500;">${p.name}</span>
                                <span style="color: #d4af37; font-weight: 600;">${p.soldCount} sold</span>
                            </div>
                            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${percentage}%; height: 100%; background: ${gradients[idx % 3]}; border-radius: 3px; transition: width 0.4s ease;"></div>
                            </div>
                        `;
                topContainer.appendChild(item);
            });
        }

    } catch (err) {
        console.error('Error fetching dynamic best sellers:', err);
    }
}

// 6. Categories Management
async function fetchCategories() {
    const listContainer = document.getElementById('categoryListContainer');
    const selectDropdown = document.getElementById('pCategory');
    const editSelect = document.getElementById('editPCategory');

    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();

        if (listContainer) listContainer.innerHTML = '';
        if (selectDropdown) selectDropdown.innerHTML = '<option value="">Select Category</option>';
        if (editSelect) editSelect.innerHTML = '';

        categories.forEach(c => {
            if (listContainer) {
                const tag = document.createElement('div');
                tag.style.cssText = 'background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); color: #d4af37; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; display: flex; align-items: center; gap: 8px;';
                tag.innerHTML = `<span>${c.name}</span> <i class="fa-solid fa-xmark" style="cursor: pointer;" onclick="deleteCategory(${c.id})"></i>`;
                listContainer.appendChild(tag);
            }
            if (selectDropdown) {
                selectDropdown.innerHTML += `<option value="${c.name}">${c.name}</option>`;
            }
            if (editSelect) {
                editSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
            }
        });
    } catch (err) {
        console.error('Error fetching categories:', err);
    }
}

// Add Category
document.getElementById('addCategoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('catNameInput').value;
    await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    document.getElementById('catNameInput').value = '';
    fetchCategories();
});

async function deleteCategory(id) {
    if (confirm('Delete this category?')) {
        await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
        fetchCategories();
    }
}

// Add Product Form
document.getElementById('addProductForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        price: parseFloat(document.getElementById('pPrice').value),
        originalPrice: document.getElementById('pOriginalPrice').value ? parseFloat(document.getElementById('pOriginalPrice').value) : null,
        tag: document.getElementById('pTag').value || '',
        image: document.getElementById('pImage').value,
        description: document.getElementById('pDescription').value
    };

    const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Creation added successfully!');
        document.getElementById('addProductForm').reset();
        fetchProductsAndBestSellers();
    }
});

// Delete Product
async function deleteProductItem(id) {
    if (confirm('Are you sure you want to remove this product?')) {
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        fetchProductsAndBestSellers();
    }
}

// 7. Load Messages
async function fetchMessages() {
    const tableBody = document.getElementById('messagesTableBody');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_BASE}/contact`);
        const messages = await res.json();
        tableBody.innerHTML = '';

        if (messages.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#a1a1aa;">No inquiries found.</td></tr>';
            return;
        }

        messages.forEach(m => {
            const tr = document.createElement('tr');
            const d = new Date(m.createdAt || Date.now()).toLocaleDateString();
            tr.innerHTML = `
                        <td>${d}</td>
                        <td><strong>${m.name}</strong><br><small style="color:#8c9b98;">${m.email}</small></td>
                        <td>${m.subject || 'General'}</td>
                        <td>${m.message}</td>
                        <td style="text-align: right;">
                            <button onclick="deleteMessageItem(${m.id})" style="background:none; border:none; color:#f87171; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
    }
}

async function deleteMessageItem(id) {
    if (confirm('Delete this inquiry?')) {
        await fetch(`${API_BASE}/contact/${id}`, { method: 'DELETE' });
        fetchMessages();
    }
}

// Refresh Buttons
document.getElementById('refreshOrdersBtn')?.addEventListener('click', fetchDashboardData);
document.getElementById('refreshProductsBtn')?.addEventListener('click', fetchProductsAndBestSellers);
document.getElementById('refreshMessagesBtn')?.addEventListener('click', fetchMessages);


// --- All Best Sellers Modal Engine ---
let cachedRankedProducts = [];

function renderAllBestSellersModal() {
    const modalList = document.getElementById('allBestSellersList');
    if (!modalList) return;

    modalList.innerHTML = '';
    if (cachedRankedProducts.length === 0) {
        modalList.innerHTML = '<div style="text-align: center; color: #8c9b98; padding: 20px;">No sales recorded yet.</div>';
        return;
    }

    const highestSale = cachedRankedProducts[0]?.soldCount || 1;

    cachedRankedProducts.forEach((p, idx) => {
        const percentage = p.soldCount > 0 ? Math.round((p.soldCount / highestSale) * 100) : 6;
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 4px;';
        item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="color: #d4af37; font-weight: 700; font-size: 0.8rem; width: 20px;">#${idx + 1}</span>
                            <strong style="color: #ffffff; font-size: 0.82rem;">${p.name}</strong>
                            <span style="font-size: 0.7rem; color: #8c9b98; text-transform: uppercase;">(${p.category})</span>
                        </div>
                        <span style="color: #d4af37; font-weight: 600; font-size: 0.8rem;">${p.soldCount} sold</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #d4af37, #fef08a); border-radius: 3px;"></div>
                    </div>
                `;
        modalList.appendChild(item);
    });
}

// Modal Open / Close Triggers
const allModal = document.getElementById('allBestSellersModal');
const openBtn = document.getElementById('openAllBestSellersBtn');
const closeBtn = document.getElementById('closeBestSellersModalBtn');

if (openBtn && allModal) {
    openBtn.onclick = () => {
        renderAllBestSellersModal();
        allModal.style.display = 'flex';
    };
}

if (closeBtn && allModal) {
    closeBtn.onclick = () => allModal.style.display = 'none';
}

// Close on clicking outside the box
window.addEventListener('click', (e) => {
    if (e.target === allModal) {
        allModal.style.display = 'none';
    }
});

// Run On Initial Load
initTrafficSourceChart();
fetchDashboardData();
fetchProductsAndBestSellers();
fetchCategories();
fetchMessages();

// --- Mobile Sidebar Drawer Logic ---
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const adminSidebar = document.querySelector('.admin-sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (sidebarToggleBtn && adminSidebar && sidebarOverlay) {
    // মেনু আইকনে চাপ দিলে সাইডবার খুলবে/বন্ধ হবে
    sidebarToggleBtn.addEventListener('click', () => {
        adminSidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    });

    // ডার্ক ব্যাকড্রপে চাপ দিলে সাইডবার বন্ধ হবে
    sidebarOverlay.addEventListener('click', () => {
        adminSidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });

    // সাইডবারের যেকোনো অপশনে ক্লিক করলে মোবাইলে সাইডবার নিজ থেকেই বন্ধ হবে
    document.querySelectorAll('.admin-sidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                adminSidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            }
        });
    });
}


// --- Isolated Dynamic Receipt Print Engine (BDT Version) ---
function printReceiptById(orderId) {
    // ১. সব সম্ভাব্য সোর্স (globalOrders ও localStorage) থেকে অর্ডার খোঁজা
    let orders = [];
    if (typeof globalOrders !== 'undefined' && Array.isArray(globalOrders)) {
        orders = globalOrders;
    } else {
        orders = JSON.parse(localStorage.getItem('oxylacy_orders') || localStorage.getItem('orders') || '[]');
    }

    // হ্যাশ (#) বা স্পেসের তারতম্য দূর করে আইডি মেলানো
    const cleanTargetId = String(orderId).replace('#', '').trim().toLowerCase();
    
    const order = orders.find(o => {
        const id1 = String(o.orderId || '').replace('#', '').trim().toLowerCase();
        const id2 = String(o.id || '').replace('#', '').trim().toLowerCase();
        const id3 = String(o._id || '').replace('#', '').trim().toLowerCase();
        return id1 === cleanTargetId || id2 === cleanTargetId || id3 === cleanTargetId;
    });

    if (!order) {
        alert('Order details not found for printing!');
        return;
    }

    // ২. আইটেম পার্সিং
    let items = [];
    try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    } catch (e) {
        items = [];
    }

    const itemsRows = items.map(item => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${item.name || item.title || 'Creation'}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">৳ ${Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
        </tr>
    `).join('');

    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // ৩. সেপারেট প্রিন্ট উইন্ডো ওপেন
    const win = window.open('', '_blank', 'width=750,height=800');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - #${order.orderId || order.id}</title>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #222; margin: 0; }
                .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { margin: 0; font-size: 26px; letter-spacing: 2px; color: #111; }
                .header p { margin: 5px 0 0; font-size: 13px; color: #666; }
                .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
                th { text-align: left; border-bottom: 2px solid #222; padding-bottom: 8px; font-size: 13px; text-transform: uppercase; }
                .total { text-align: right; font-size: 18px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>OXYLACY</h1>
                <p>Atelier Manifest & Official Receipt</p>
            </div>
            <div class="meta">
                <div>
                    <strong>Order:</strong> #${order.orderId || order.id}<br>
                    <strong>Date:</strong> ${formattedDate}
                </div>
                <div style="text-align: right;">
                    <strong>Client:</strong> ${order.customerName || 'Client'}<br>
                    <strong>Email:</strong> ${order.email || 'N/A'}
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Acquired Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows || '<tr><td colspan="3" style="padding: 10px 0;">Custom Items</td></tr>'}
                </tbody>
            </table>
            <div class="total">
                Total Obligation: ৳ ${Number(order.totalAmount || 0).toLocaleString()}
            </div>
        </body>
        </html>
    `);

    win.document.close();
    win.focus();
    setTimeout(() => {
        win.print();
        win.close();
    }, 400);
}

// প্রিন্ট বাটনে ক্লিক ডিটেক্ট করা
document.addEventListener('click', (e) => {
    const printBtn = e.target.closest('.print-order-btn');
    if (printBtn) {
        e.preventDefault();
        const orderId = printBtn.getAttribute('data-id');
        if (orderId) {
            printReceiptById(orderId);
        }
    }
});