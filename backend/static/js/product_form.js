
// Unified Product Form JavaScript for MIMI STORE
document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation elements
    const tabButtons = document.querySelectorAll('.tab-nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const currentTabIndicator = document.querySelector('.current-tab');
    const totalTabsIndicator = document.querySelector('.total-tabs');

    if (totalTabsIndicator) {
        totalTabsIndicator.textContent = tabButtons.length;
    }

    // Function to switch tabs
    window.switchToTab = function(tabId) {
        console.log('Switching to tab:', tabId);
        
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Find and activate the requested tab
        // Support both exact ID and localized hashes if they occur
        let targetTab = document.querySelector(`[data-tab="${tabId}"]`);
        let targetContent = document.getElementById(tabId);

        // Fallback for localized hashes (e.g., #/tab-معرض-الصور)
        if (!targetTab && tabId.includes('tab-')) {
            const cleanId = tabId.split('tab-')[1];
            // Map Arabic names to English IDs if necessary
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
            targetTab = document.querySelector(`[data-tab="${mappedId}"]`);
            targetContent = document.getElementById(mappedId);
        }

        if (targetTab && targetContent) {
            targetTab.classList.add('active');
            targetContent.classList.add('active');
            
            // Update URL hash without jumping
            const url = new URL(window.location);
            url.hash = targetTab.getAttribute('data-tab');
            window.history.pushState({}, '', url);
            
            updateTabIndicator();
        }
    };

    // Click event for tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            window.switchToTab(tabId);
        });
    });

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
    function updateTabIndicator() {
        const activeTab = document.querySelector('.tab-nav-item.active');
        if (!activeTab || !currentTabIndicator) return;

        const tabs = Array.from(tabButtons);
        const currentIndex = tabs.indexOf(activeTab) + 1;

        currentTabIndicator.textContent = currentIndex;

        if (prevBtn) prevBtn.disabled = currentIndex === 1;
        if (nextBtn) nextBtn.disabled = currentIndex === tabs.length;
        
        // Ensure manual navigation visibility
        const navContainer = document.querySelector('.tab-navigation-buttons');
        if (navContainer) navContainer.style.display = 'flex';
    }

    // Initialize from URL hash or first tab
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        window.switchToTab(initialHash);
    } else if (tabButtons.length > 0) {
        window.switchToTab(tabButtons[0].getAttribute('data-tab'));
    }

    // --- Original Logic from product_form.js ---

    // Image preview functionality
    const imageField = document.getElementById('id_image');
    const imagePreview = document.querySelector('.image-upload img');
    const uploadBtn = document.querySelector('.upload-btn');

    if (imageField && imagePreview && uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            imageField.click();
        });

        imageField.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Auto-fill product name in meta title and slug
    const nameField = document.querySelector('#id_name');
    const metaTitleField = document.querySelector('#id_meta_title');
    const slugField = document.querySelector('#id_slug');

    if (nameField) {
        nameField.addEventListener('blur', function() {
            if (metaTitleField && !metaTitleField.value) {
                metaTitleField.value = this.value;
            }
            if (slugField && !slugField.value) {
                let slug = this.value.toLowerCase()
                    .replace(/[^ا-يa-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                slugField.value = slug;
            }
        });
    }

    // Price calculation
    const priceField = document.querySelector('#id_price');
    const discountField = document.querySelector('#id_discount');
    const specialPriceField = document.querySelector('#id_special_price');

    if (priceField && discountField && specialPriceField) {
        const updatePrice = function() {
            const price = parseFloat(priceField.value) || 0;
            const discount = parseFloat(discountField.value) || 0;
            if (discount > 0 && discount < 100) {
                const discountedPrice = price * (1 - discount / 100);
                specialPriceField.value = discountedPrice.toFixed(2);
            }
        };
        discountField.addEventListener('input', updatePrice);
        priceField.addEventListener('input', updatePrice);
    }
});
