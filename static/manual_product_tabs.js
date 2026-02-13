/* Product form tabs: convert fieldsets (and inline groups) into clickable tabs */
(function () {
    console.log("🛠️ Mimi Tabs: Initializing...");
    
    function initMimiTabs() {
        // Run on Django admin product and banner add/change pages
        const productPathOk = /\/admin\/products\/product\//.test(window.location.pathname);
        const bannerPathOk = /\/admin\/products\/banner\//.test(window.location.pathname);
        const appOk = document.body.classList.contains('app-products');
        
        if (!(productPathOk || bannerPathOk || appOk)) {
            console.log("🛠️ Mimi Tabs: Path not matching, skipping.");
            return;
        }

        const form = document.querySelector('form');
        if (!form) return;

        // Collect panels: fieldsets and inline groups
        const fieldsets = Array.from(form.querySelectorAll('fieldset'));
        const inlines = Array.from(document.querySelectorAll('.inline-group, .inline-related'));
        const panels = fieldsets.concat(inlines).filter(p => {
            // Skip panels that don't have visible form fields or rows
            return p.querySelector('div, p, table, .form-row, .field, .form-horizontal, .inline-related');
        });
        
        if (!panels.length) {
            console.log("🛠️ Mimi Tabs: No panels found.");
            return;
        }

        console.log(`🛠️ Mimi Tabs: Found ${panels.length} panels.`);

        // Helper: get panel title text
        function getPanelTitle(panel) {
            const legend = panel.querySelector('legend, h2');
            if (legend && legend.textContent.trim()) return legend.textContent.trim();
            const inlineHeader = panel.querySelector('.inline-group h2, .inline-related h2');
            if (inlineHeader) return inlineHeader.textContent.trim();
            return 'القسم';
        }

        // Helper: normalize text to slug for comparison/hash (supports Arabic)
        function norm(text) {
            return (text || '')
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '') // keep Arabic, Latin, digits, hyphen
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Build container + nav
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'mimi-tabs-container';
        const tabsNav = document.createElement('div');
        tabsNav.className = 'mimi-tabs-nav';
        tabsContainer.appendChild(tabsNav);

        // Insert before first panel
        const firstPanel = panels[0];
        if (!firstPanel || !firstPanel.parentNode) return;
        firstPanel.parentNode.insertBefore(tabsContainer, firstPanel);

        // Styles
        const style = document.createElement('style');
        style.textContent = `
      .mimi-tabs-nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
      .mimi-tab-btn { border: 1px solid #e0e0e0; background: #f8f9fa; color: #555; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: 600; transition: all .2s ease; font-size: 14px; }
      .mimi-tab-btn:hover { background: #e9ecef; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
      .mimi-tab-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
      
      /* Class to hide panels - only active if script runs successfully */
      .mimi-tabs-enabled .mimi-tab-panel { display: none !important; }
      .mimi-tabs-enabled .mimi-tab-panel.active { display: block !important; }
      
      /* Hide original legends if they are redundant */
      .mimi-tabs-enabled fieldset legend { opacity: 0.6; font-size: 0.8em; }
    `;
        document.head.appendChild(style);

        // Create buttons and mark panels
        const buttonById = new Map();
        const panelById = new Map();
        const slugToPanelId = new Map();

        // Try to reuse existing nav links if any
        const existingNavLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"], a[href^="#"][role="tab"]'));

        panels.forEach((panel, idx) => {
            const title = getPanelTitle(panel);
            const panelId = 'mimi-tab-' + idx;
            const slug = norm(title);

            panel.dataset.mimiTabId = panelId;
            panel.classList.add('mimi-tab-panel');
            panelById.set(panelId, panel);
            slugToPanelId.set(slug, panelId);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mimi-tab-btn';
            btn.textContent = title;
            btn.dataset.target = panelId;
            btn.dataset.slug = slug;
            tabsNav.appendChild(btn);
            buttonById.set(panelId, btn);

            // Make legend clickable too
            const legend = panel.querySelector('legend, h2');
            if (legend) {
                legend.style.cursor = 'pointer';
                legend.title = "انقر للتبديل للوضع الكامل";
            }
        });

        const tabButtons = Array.from(tabsNav.querySelectorAll('.mimi-tab-btn'));
        if (!tabButtons.length) return;

        // Activate helper
        function activate(panelId) {
            tabButtons.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            const btn = buttonById.get(panelId);
            const pnl = panelById.get(panelId);
            if (btn) btn.classList.add('active');
            if (pnl) pnl.classList.add('active');
            
            if (btn) {
                const slug = btn.dataset.slug || norm(btn.textContent);
                // Update hash without scrolling
                if (history.replaceState) {
                    history.replaceState(null, '', '#' + slug + '-tab');
                } else {
                    location.hash = slug + '-tab';
                }
            }
        }

        // Click event listener
        tabsNav.addEventListener('click', function (e) {
            const btn = e.target.closest('.mimi-tab-btn');
            if (!btn) return;
            e.preventDefault();
            activate(btn.dataset.target);
        });

        // Function to activate tab by hash
        function activateByHash(hashValue) {
            if (!hashValue) return false;
            const clean = decodeURIComponent(hashValue.replace('#', '')).trim().replace(/-tab$/i, '');
            const slug = norm(clean);
            
            const targetId = slugToPanelId.get(slug);
            if (targetId) {
                activate(targetId);
                return true;
            }
            
            // Fallback: search buttons for a match in text or slug
            const match = tabButtons.find(b => b.dataset.slug === slug || norm(b.textContent) === slug);
            if (match) {
                activate(match.dataset.target);
                return true;
            }
            return false;
        }

        // React to hash changes
        window.addEventListener('hashchange', function () {
            activateByHash(location.hash);
        });

        // Enable the tab mode by adding class to body
        document.body.classList.add('mimi-tabs-enabled');

        // Initial activation: check hash or use first tab
        if (!activateByHash(location.hash)) {
            const firstId = panels[0].dataset.mimiTabId;
            if (firstId) activate(firstId);
        }

        console.log("🛠️ Mimi Tabs: Initialized successfully.");
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMimiTabs);
    } else {
        initMimiTabs();
    }
})();
