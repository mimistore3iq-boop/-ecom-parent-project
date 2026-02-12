/* ===== voro Admin Custom JavaScript ===== */

// Helper function to safely run code after DOM is loaded
function onDocumentReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

onDocumentReady(function() {
    console.log('🛍️ voro Admin Panel Initializing...');

    // Initialize all custom features
    addNotificationStyles();
    initializeAnimations();
    initializeTooltips();
    initializeConfirmations();
    initializeDashboardWidgets();
    initializeSearchEnhancements();
    initializeFormEnhancements();
    initializeTableEnhancements();
    initializeImgbbUploader();
    enhanceSidebarToggle();
    initializeDarkMode();
    initializePerformanceMonitoring();

    console.log('✅ voro Admin Panel Loaded Successfully!');
});


// ===== FEATURE INITIALIZERS =====

// Animation System
function initializeAnimations() {
    const contentElements = document.querySelectorAll('.content-wrapper > *');
    contentElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });

    const cards = document.querySelectorAll('.card, .box, .info-box');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Enhanced Tooltips
function initializeTooltips() {
    if (typeof $ !== 'undefined' && $.fn.tooltip) {
        $('[data-toggle="tooltip"]').tooltip();
    } else {
        console.warn('Popper.js or jQuery not found, tooltips disabled.');
    }
}

// Confirmation Dialogs
function initializeConfirmations() {
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('input[name="_selected_action"], .deletelink, [href*="delete"]');
        if (target) {
            if (target.value === 'delete_selected' || target.classList.contains('deletelink') || target.href.includes('delete')) {
                const confirmed = confirm('⚠️ هل أنت متأكد من أنك تريد حذف هذا العنصر؟\n\nهذا الإجراء لا يمكن التراجع عنه.');
                if (!confirmed) {
                    e.preventDefault();
                }
            }
        }
    }, true);
}

// Dashboard Widgets Enhancement
function initializeDashboardWidgets() {
    const infoBoxes = document.querySelectorAll('.info-box');
    infoBoxes.forEach(box => {
        box.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => { this.style.transform = 'scale(1)'; }, 150);
        });
    });
}

// Search Enhancements
function initializeSearchEnhancements() {
    document.querySelectorAll('input[type="search"], input[name="q"]').forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const icon = document.createElement('i');
        icon.className = 'fas fa-search';
        icon.style.cssText = 'position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#6c757d; pointer-events:none;';
        wrapper.appendChild(icon);

        input.addEventListener('input', function () {
            if (this.value.length > 0) {
                icon.className = 'fas fa-times';
                icon.style.pointerEvents = 'auto';
                icon.style.cursor = 'pointer';
                icon.onclick = () => {
                    input.value = '';
                    icon.className = 'fas fa-search';
                    icon.style.pointerEvents = 'none';
                    input.focus();
                };
            } else {
                icon.className = 'fas fa-search';
                icon.style.pointerEvents = 'none';
            }
        });
    });
}

// Form Enhancements
function initializeFormEnhancements() {
    document.querySelectorAll('.form-control').forEach(control => {
        control.addEventListener('focus', function () {
            this.style.borderColor = '#6f42c1';
            this.style.boxShadow = '0 0 0 0.2rem rgba(111, 66, 193, 0.25)';
        });
        control.addEventListener('blur', function () {
            this.style.borderColor = '#e9ecef';
            this.style.boxShadow = 'none';
        });
    });
}

// Table Enhancements
function initializeTableEnhancements() {
    document.querySelectorAll('.table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', function () {
            this.style.backgroundColor = 'rgba(111, 66, 193, 0.05)';
        });
        row.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '';
        });
    });
}

// Notification System
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.innerHTML = `<span>${message}</span><button type="button" class="close" onclick="this.parentElement.remove()">&times;</button>`;
    notification.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; min-width:300px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); animation:slideInRight 0.3s ease;';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        .notification-toast { transition: all 0.3s ease; }
        .notification-toast:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
    `;
    document.head.appendChild(style);
}

// Sidebar Toggle Enhancement
function enhanceSidebarToggle() {
    const sidebarToggle = document.querySelector('[data-widget="pushmenu"]');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.main-sidebar');
            if (sidebar) sidebar.style.transition = 'all 0.3s ease';
        });
    }
}

// Dark Mode Toggle
function initializeDarkMode() {
    const darkModeToggle = document.createElement('button');
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.className = 'btn btn-sm btn-outline-light';
    darkModeToggle.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:9999; border-radius:50%; width:50px; height:50px; box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    darkModeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        this.querySelector('i').className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.querySelector('i').className = 'fas fa-sun';
    }
    document.body.appendChild(darkModeToggle);
}

// Performance Monitoring
function initializePerformanceMonitoring() {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`📊 Page loaded in ${Math.round(loadTime)}ms`);
        if (loadTime > 3000) console.warn('⚠️ Page load time is slow. Consider optimizing.');
    });
}

// ImgBB Uploader
function initializeImgbbUploader() {
    setTimeout(() => {
        if (!document.body.classList.contains('change-form') || !document.querySelector('#product_form')) return;
        console.log('Initializing ImgBB Uploader...');

        const imageFields = ['main_image', 'image_2', 'image_3', 'image_4'];
        const uploadUrl = '/api/products/upload-image/';

        imageFields.forEach(fieldName => {
            const urlInput = document.querySelector(`#id_${fieldName}`);
            if (!urlInput) return;

            let container = urlInput.closest('.form-row') || urlInput.parentElement;
            if (container.querySelector('.imgbb-uploader')) return;

            const uploaderContainer = document.createElement('div');
            uploaderContainer.className = 'imgbb-uploader';
            uploaderContainer.style.marginTop = '10px';

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.id = `imgbb-upload-${fieldName}`;

            const uploadButton = document.createElement('label');
            uploadButton.htmlFor = fileInput.id;
            uploadButton.className = 'btn btn-sm btn-outline-primary';
            uploadButton.innerHTML = '<i class="fas fa-upload"></i> رفع صورة من الجهاز';
            uploadButton.style.cursor = 'pointer';

            const statusText = document.createElement('span');
            statusText.className = 'imgbb-status';
            statusText.style.marginLeft = '10px';

            const previewContainer = document.createElement('div');
            previewContainer.className = 'imgbb-preview';
            previewContainer.style.marginTop = '10px';

            uploaderContainer.append(fileInput, uploadButton, statusText);
            container.append(uploaderContainer, previewContainer);

            fileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                statusText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الرفع...';
                uploadButton.classList.add('disabled');

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch(uploadUrl, {
                        method: 'POST',
                        body: formData,
                        headers: { 'X-CSRFToken': getCookie('csrftoken') },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.url) {
                        urlInput.value = data.url;
                        statusText.innerHTML = '<i class="fas fa-check-circle" style="color: green;"></i> تم الرفع بنجاح!';
                        updatePreview(data.url, previewContainer);
                    } else {
                        throw new Error('Image URL not found in response.');
                    }
                } catch (error) {
                    console.error('ImgBB Upload Error:', error);
                    statusText.innerHTML = `<i class="fas fa-times-circle" style="color: red;"></i> فشل الرفع: ${error.message}`;
                } finally {
                    uploadButton.classList.remove('disabled');
                    setTimeout(() => { statusText.innerHTML = ''; }, 5000);
                }
            });

            if (urlInput.value) updatePreview(urlInput.value, previewContainer);
            urlInput.addEventListener('input', () => updatePreview(urlInput.value, previewContainer));
        });

        function updatePreview(url, container) {
            container.innerHTML = url ? `<img src="${url}" style="max-width:200px; max-height:200px; border-radius:8px; margin-top:5px;">` : '';
        }

        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    }, 500);
}