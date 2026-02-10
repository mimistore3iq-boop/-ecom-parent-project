
// Unified Product Form JavaScript for MIMI STORE
// Ensure switchToTab is available immediately
window.switchToTab = function(tabId) {
    if (!tabId) return;
    
    // Clean tabId from hash and suffixes
    let cleanId = tabId.toString().replace('#', '').replace('tab-', '').replace('-tab', '');
    
    // Decode URI component for Arabic hashes
    try {
        cleanId = decodeURIComponent(cleanId);
    } catch (e) {
        console.error('Error decoding tab ID:', e);
    }
    
    console.log('Switching to tab:', cleanId);
    
    // Map Arabic names to English IDs used in data-tab and id
    const mapping = {
        'معلومات-أساسية': 'basic-info',
        'التسعير-والخصومات': 'pricing',
        'إدارة-المخزون': 'inventory',
        'معرض-الصور': 'gallery',
        'تفاصيل-المنتج': 'details',
        'SEO-والبيانات-الوصفية': 'seo',
        'الحالة-والمميزات': 'features'
    };
    
    const mappedId = mapping[cleanId] || cleanId;
    console.log('Mapped ID:', mappedId);

    // Find and activate the requested tab
    const targetTab = document.querySelector(`[data-tab="${mappedId}"]`);
    const targetContent = document.getElementById(mappedId);

    if (targetTab && targetContent) {
        const tabButtons = document.querySelectorAll('.tab-nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Remove active class from all
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add to target
        targetTab.classList.add('active');
        targetContent.classList.add('active');
        
        // Update URL hash without jumping
        const url = new URL(window.location);
        url.hash = cleanId + '-tab';
        window.history.pushState({}, '', url);
        
        if (typeof updateTabIndicator === 'function') {
            updateTabIndicator();
        }
        console.log('Successfully switched to', mappedId);
    } else {
        console.warn('Tab or content not found for:', mappedId);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Product form JS loaded');
    
    // Tab navigation elements
    const tabButtons = document.querySelectorAll('.tab-nav-item');
    const totalTabsIndicator = document.querySelector('.total-tabs');

    if (totalTabsIndicator) {
        totalTabsIndicator.textContent = tabButtons.length;
    }

    // Navigation function (Previous/Next)
    window.navigateTab = function(direction) {
        const activeTab = document.querySelector('.tab-nav-item.active');
        if (!activeTab) return;

        const tabs = Array.from(tabButtons);
        const currentIndex = tabs.indexOf(activeTab);

        let newIndex;
        if (direction === 'next') {
            newIndex = Math.min(currentIndex + 1, tabs.length - 1);
        } else if (direction === 'prev') {
            newIndex = Math.max(currentIndex - 1, 0);
        }

        if (newIndex !== undefined && newIndex !== currentIndex) {
            const newTabId = tabs[newIndex].getAttribute('data-tab');
            window.switchToTab(newTabId);
        }
    };

    // Update tab indicator and button states
    window.updateTabIndicator = function() {
        const activeTab = document.querySelector('.tab-nav-item.active');
        const currentTabIndicator = document.querySelector('.current-tab');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (!activeTab || !currentTabIndicator) return;

        const tabs = Array.from(tabButtons);
        const currentIndex = tabs.indexOf(activeTab) + 1;

        currentTabIndicator.textContent = currentIndex;

        if (prevBtn) prevBtn.disabled = currentIndex === 1;
        if (nextBtn) nextBtn.disabled = currentIndex === tabs.length;
    };

    // Initialize from URL hash or first tab
    setTimeout(() => {
        const initialHash = window.location.hash;
        if (initialHash) {
            window.switchToTab(initialHash);
        } else if (tabButtons.length > 0) {
            window.switchToTab(tabButtons[0].getAttribute('data-tab'));
        }
    }, 200);

    // Price and Discount amount calculation logic
    const priceField = document.querySelector('#id_price');
    const discountPriceField = document.querySelector('#id_discount_price');
    const discountAmountField = document.querySelector('#id_discount_amount');

    if (priceField && discountPriceField && discountAmountField) {
        const updateFromDiscountPrice = function() {
            const price = parseFloat(priceField.value) || 0;
            const discountPrice = parseFloat(discountPriceField.value) || 0;
            if (price > 0 && discountPrice > 0) {
                discountAmountField.value = (price - discountPrice).toFixed(2);
            }
        };

        const updateFromDiscountAmount = function() {
            const price = parseFloat(priceField.value) || 0;
            const discountAmount = parseFloat(discountAmountField.value) || 0;
            if (price > 0 && discountAmount > 0) {
                discountPriceField.value = (price - discountAmount).toFixed(2);
            }
        };

        discountPriceField.addEventListener('input', updateFromDiscountPrice);
        discountAmountField.addEventListener('input', updateFromDiscountAmount);
    }
});
