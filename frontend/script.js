// API Configuration
const API_BASE_URL = 'https://ecom-parent-project.onrender.com/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const cartBtn = document.getElementById('cartBtn');
const searchInput = document.getElementById('searchInput');
const categoriesGrid = document.getElementById('categoriesGrid');
const productsGrid = document.getElementById('productsGrid');
const loginModal = document.getElementById('loginModal');
const cartModal = document.getElementById('cartModal');
const productModal = document.getElementById('productModal');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');
const categoriesBtn = document.getElementById('categoriesBtn');
const categoriesDropdown = document.getElementById('categoriesDropdown');

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
});

// Initialize Application
async function initializeApp() {
    updateCartCount();
    updateLoginButton();
    await loadCategories();
    await loadFeaturedProducts();
}

// Setup Event Listeners
function setupEventListeners() {
    // Login Modal
    loginBtn.addEventListener('click', () => {
        if (currentUser) {
            logout();
        } else {
            showModal('loginModal');
        }
    });

    // Cart Modal
    cartBtn.addEventListener('click', () => showModal('cartModal'));

    // Categories Dropdown
    categoriesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.querySelector('.dropdown');
        dropdown.classList.toggle('show');
        
        // If dropdown is opening, ensure categories are loaded
        if (dropdown.classList.contains('show')) {
            // Check if categories are already loaded
            const dropdownLinks = dropdown.querySelectorAll('.dropdown-content a');
            if (dropdownLinks.length <= 1) { // Only "All Products" exists
                loadCategories();
            }
        }
    });

    // Close dropdown on outside click
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Modal Close Buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Bottom Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Modal Background Click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        console.log('Making API request to:', url);
        const response = await fetch(url, config);

        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response:', data);
        return data;
    } catch (error) {
        console.error('API Error:', error);

        // More specific error messages
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('فشل في الاتصال بالخادم. تأكد من تشغيل Backend', 'error');
        } else if (error.message.includes('CORS')) {
            showToast('مشكلة في إعدادات CORS', 'error');
        } else {
            showToast(error.message || 'حدث خطأ في الاتصال', 'error');
        }

        throw error;
    }
}

// Load Categories
async function loadCategories() {
    try {
        showLoading();
        // Add cache busting parameter to prevent caching
        const timestamp = new Date().getTime();
        const data = await apiRequest(`/products/categories/?_t=${timestamp}`);
        displayCategories(data.results || data);
    } catch (error) {
        console.error('Error loading categories:', error);
    } finally {
        hideLoading();
    }
}

// Display Categories
function displayCategories(categories) {
    // Hide the old categories grid section
    const categoriesSection = document.querySelector('.categories');
    if (categoriesSection) {
        categoriesSection.style.display = 'none';
    }

    const categoriesDropdown = document.getElementById('categoriesDropdown');
    // Clear existing content
    categoriesDropdown.innerHTML = '';
    
    // Add "All Products" option
    const allProductsLink = document.createElement('a');
    allProductsLink.href = '#';
    allProductsLink.textContent = 'جميع المنتجات';
    allProductsLink.dataset.categoryId = 'all';
    categoriesDropdown.appendChild(allProductsLink);
    
    // Add a separator
    const separator = document.createElement('div');
    separator.style.height = '1px';
    separator.style.background = '#eee';
    separator.style.margin = '5px 0';
    categoriesDropdown.appendChild(separator);

    // Add each category
    categories.forEach(category => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = category.name;
        link.dataset.categoryId = category.id;
        categoriesDropdown.appendChild(link);
    });

    // Add event listeners to the new links
    categoriesDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.target.dataset.categoryId;
            if (categoryId === 'all') {
                loadAllProducts();
            } else {
                loadCategoryProducts(categoryId);
            }
            // Hide dropdown after selection
            document.querySelector('.dropdown').classList.remove('show');
        });
    });
}

// Load Featured Products
async function loadFeaturedProducts() {
    try {
        showLoading();
        // Add cache busting parameter to prevent caching
        const timestamp = new Date().getTime();
        const data = await apiRequest(`/products/featured/?_t=${timestamp}`);
        displayProducts(data.results || data);
    } catch (error) {
        console.error('Error loading products:', error);
    } finally {
        hideLoading();
    }
}

// Load All Products
async function loadAllProducts() {
    try {
        showLoading();
        // Add cache busting parameter to prevent caching
        const timestamp = new Date().getTime();
        const data = await apiRequest(`/products/?_t=${timestamp}`);
        displayProducts(data.results || data);
    } catch (error) {
        console.error('Error loading products:', error);
    } finally {
        hideLoading();
    }
}

// Load Category Products
async function loadCategoryProducts(categoryId) {
    try {
        showLoading();
        // Add cache busting parameter to prevent caching
        const timestamp = new Date().getTime();
        const data = await apiRequest(`/products/?category=${categoryId}&_t=${timestamp}`);
        displayProducts(data.results || data);
        showToast(`تم تحميل منتجات القسم`);
    } catch (error) {
        console.error('Error loading category products:', error);
        showToast('فشل في تحميل منتجات القسم', 'error');
    } finally {
        hideLoading();
    }
}

// Display Products
function displayProducts(products) {
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h4>لا توجد منتجات</h4>
                <p>لم يتم العثور على منتجات في هذا القسم</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetails(${product.id})">
            <div class="product-image">
                ${product.main_image_url ?
            `<img src="${product.main_image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` :
            `<i class="fas fa-mobile-alt"></i>`
        }
                ${product.is_on_sale ? `<div class="discount-badge">خصم ${product.discount_percentage}%</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-brand">${product.brand}</div>
                <div class="product-price">
                    <span class="current-price">${product.discounted_price || product.price} ر.س</span>
                    ${product.is_on_sale ? `<span class="original-price">${product.price} ر.س</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-primary" onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> إضافة للسلة
                    </button>
                    <button class="btn-secondary" onclick="event.stopPropagation(); showProductDetails(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Show Product Details
async function showProductDetails(productId) {
    try {
        showLoading();
        // Add cache busting parameter to prevent caching
        const timestamp = new Date().getTime();
        const product = await apiRequest(`/products/${productId}/?_t=${timestamp}`);

        document.getElementById('productModalTitle').textContent = product.name;
        document.getElementById('productDetails').innerHTML = `
            <div style="padding: 20px;">
                <div class="product-image" style="height: 250px; margin-bottom: 20px;">
                    ${product.main_image_url ?
                `<img src="${product.main_image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` :
                `<i class="fas fa-mobile-alt"></i>`
            }
                </div>
                <h3>${product.name}</h3>
                <p style="color: #666; margin: 10px 0;">${product.brand}</p>
                <p style="margin: 15px 0;">${product.description || 'لا يوجد وصف متاح'}</p>
                <div class="product-price" style="margin: 20px 0;">
                    <span class="current-price" style="font-size: 1.5rem;">${product.discounted_price || product.price} ر.س</span>
                    ${product.is_on_sale ? `<span class="original-price">${product.price} ر.س</span>` : ''}
                </div>
                <div style="margin: 15px 0;">
                    <span style="color: ${product.is_in_stock ? '#4CAF50' : '#f44336'};">
                        <i class="fas fa-circle" style="font-size: 0.8rem;"></i>
                        ${product.stock_status_display}
                    </span>
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="addToCart(${product.id}); hideModal('productModal');">
                    <i class="fas fa-cart-plus"></i> إضافة للسلة
                </button>
            </div>
        `;

        showModal('productModal');
    } catch (error) {
        console.error('Error loading product details:', error);
        showToast('المنتج غير موجود', 'error');
    } finally {
        hideLoading();
    }
}

// Add to Cart
function addToCart(productId) {
    if (!currentUser) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        showModal('loginModal');
        return;
    }

    const existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            product_id: productId,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // استدعاء دالة إضافة المنتج مع الكوبون إذا كانت موجودة
    if (typeof addToCartWithCoupon === 'function') {
        addToCartWithCoupon(productId);
    } else {
        showToast('تم إضافة المنتج للسلة');
    }
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const phone = document.getElementById('phoneInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        showLoading();
        const data = await apiRequest('/users/login/', {
            method: 'POST',
            body: JSON.stringify({ phone, password })
        });

        authToken = data.tokens.access;
        currentUser = data.user;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        updateLoginButton();
        hideModal('loginModal');
        showToast('تم تسجيل الدخول بنجاح');

        // Reset form
        document.getElementById('loginForm').reset();

    } catch (error) {
        console.error('Login error:', error);
    } finally {
        hideLoading();
    }
}

// Logout
function logout() {
    authToken = null;
    currentUser = null;
    cart = [];

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');

    updateLoginButton();
    updateCartCount();
    showToast('تم تسجيل الخروج');
}

// Update Login Button
function updateLoginButton() {
    if (currentUser) {
        loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${currentUser.first_name}</span>
        `;
    } else {
        loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>تسجيل دخول</span>
        `;
    }
}

// Handle Search
async function handleSearch() {
    const query = searchInput.value.trim();

    if (query.length < 2) {
        await loadFeaturedProducts();
        return;
    }

    try {
        showLoading();
        const data = await apiRequest(`/products/search/?q=${encodeURIComponent(query)}`);
        displayProducts(data.results || data);

        if (data.results && data.results.length === 0) {
            showToast('لم يتم العثور على منتجات');
        }
    } catch (error) {
        console.error('Search error:', error);
    } finally {
        hideLoading();
    }
}

// Handle Navigation
function handleNavigation(e) {
    const page = e.currentTarget.dataset.page;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    // Handle navigation
    switch (page) {
        case 'home':
            loadFeaturedProducts();
            break;
        case 'categories':
            loadAllProducts();
            break;
        case 'cart':
            showModal('cartModal');
            displayCart();
            break;
        case 'profile':
            if (currentUser) {
                showToast('الملف الشخصي قيد التطوير');
            } else {
                showModal('loginModal');
            }
            break;
    }
}

// Display Cart
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // استدعاء دالة عرض الكوبونات إذا كانت موجودة
    if (typeof displayCartWithCoupons === 'function') {
        displayCartWithCoupons();
        return;
    }

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h4>السلة فارغة</h4>
                <p>لم تقم بإضافة أي منتجات بعد</p>
            </div>
        `;
        cartTotal.textContent = '0';
        return;
    }

    // For demo purposes, we'll use mock product data
    // In a real app, you'd fetch product details for each cart item
    let total = 0;

    cartItems.innerHTML = cart.map((item, index) => {
        const price = 1000; // Mock price
        const itemTotal = price * item.quantity;
        total += itemTotal;

        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">منتج ${item.product_id}</div>
                    <div class="cart-item-price">${price} ر.س</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" readonly>
                    <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
    }).join('');

    cartTotal.textContent = total.toLocaleString();
}

// Update Cart Quantity
function updateCartQuantity(index, change) {
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Loading Functions
function showLoading() {
    loading.classList.add('active');
}

function hideLoading() {
    loading.classList.remove('active');
}

// Toast Functions
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    // Set toast color based on type
    if (type === 'error') {
        toastElement.style.background = '#f44336';
    } else {
        toastElement.style.background = '#4CAF50';
    }

    toastElement.classList.add('active');

    setTimeout(() => {
        toastElement.classList.remove('active');
    }, 3000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// View All Products Button
document.getElementById('viewAllBtn').addEventListener('click', loadAllProducts);