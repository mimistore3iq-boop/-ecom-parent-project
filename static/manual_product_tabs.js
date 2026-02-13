
/* 🚀 voro Admin Tabs: Improved Robust Version */
(function() {
    console.log("🚀 voro Tabs: Initializing...");

    function initVoroTabs() {
        // Detect if we are in the right admin pages
        const isProduct = window.location.pathname.includes('/products/product/');
        const isBanner = window.location.pathname.includes('/products/banner/');
        const isAddChange = window.location.pathname.includes('/add/') || /\/\d+\/change\//.test(window.location.pathname);

        if (!((isProduct || isBanner) && isAddChange)) {
            console.log("🚀 voro Tabs: Not on product/banner add/change page. Skipping.");
            return;
        }

        const container = document.querySelector('#content-main form');
        if (!container) return;

        // Find all fieldsets and inlines
        const fieldsets = Array.from(container.querySelectorAll('fieldset.module'));
        const inlines = Array.from(container.querySelectorAll('.inline-group'));
        const panels = [...fieldsets, ...inlines];

        if (panels.length <= 1) {
            console.log("🚀 voro Tabs: Not enough panels for tabs.");
            return;
        }

        console.log(`🚀 voro Tabs: Found ${panels.length} panels. Creating tabs...`);

        // Create Tabs Nav
        const tabsNav = document.createElement('div');
        tabsNav.className = 'voro-tabs-nav';
        tabsNav.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 25px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        `;

        // Style for active/inactive tabs
        const style = document.createElement('style');
        style.innerHTML = `
            .voro-tab-btn {
                padding: 10px 20px;
                border-radius: 8px;
                border: 1px solid #dee2e6;
                background: white;
                color: #495057;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                outline: none !important;
            }
            .voro-tab-btn:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            .voro-tab-btn.active {
                background: #7952b3;
                color: white;
                border-color: #7952b3;
                box-shadow: 0 4px 12px rgba(121, 82, 179, 0.3);
            }
            .voro-panel-hidden {
                display: none !important;
            }
            .voro-panel-visible {
                display: block !important;
                animation: voroFadeIn 0.4s ease;
            }
            @keyframes voroFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);

        const buttons = [];

        panels.forEach((panel, index) => {
            const titleElement = panel.querySelector('h2, legend');
            const titleText = titleElement ? titleElement.textContent.replace('Show', '').replace('Hide', '').trim() : `قسم ${index + 1}`;
            
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'voro-tab-btn';
            btn.textContent = titleText;
            btn.onclick = (e) => {
                e.preventDefault();
                activateTab(index);
            };
            
            tabsNav.appendChild(btn);
            buttons.push(btn);
            
            // Initial state
            if (index > 0) {
                panel.classList.add('voro-panel-hidden');
            } else {
                panel.classList.add('voro-panel-visible');
                btn.classList.add('active');
            }
        });

        function activateTab(index) {
            panels.forEach((p, i) => {
                if (i === index) {
                    p.classList.remove('voro-panel-hidden');
                    p.classList.add('voro-panel-visible');
                    buttons[i].classList.add('active');
                } else {
                    p.classList.remove('voro-panel-visible');
                    p.classList.add('voro-panel-hidden');
                    buttons[i].classList.remove('active');
                }
            });
            
            // Scroll to top of form
            window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
        }

        // Insert Nav before first panel
        container.insertBefore(tabsNav, panels[0]);

        // Handle URL Hash if present
        const hash = window.location.hash;
        if (hash) {
            const decodedHash = decodeURIComponent(hash).replace('#', '').replace('-tab', '');
            buttons.forEach((btn, idx) => {
                if (btn.textContent.includes(decodedHash)) {
                    activateTab(idx);
                }
            });
        }

        console.log("🚀 voro Tabs: Initialized successfully!");
    }

    // Run when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVoroTabs);
    } else {
        initVoroTabs();
    }
})();
