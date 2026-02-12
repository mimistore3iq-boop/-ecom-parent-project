/* Product form tabs: convert fieldsets (and inline groups) into clickable tabs */
(function () {
    function initMimiTabs() {
        // Run on Django admin product and banner add/change pages
        const productPathOk = /\/admin\/products\/product\//.test(window.location.pathname);
        const bannerPathOk = /\/admin\/products\/banner\//.test(window.location.pathname);
        const appOk = document.body.classList.contains('app-products');
        if (!(productPathOk || bannerPathOk || appOk)) return;

        const form = document.querySelector('form');
        if (!form) return;

        // Collect panels: fieldsets and inline groups (e.g., reviews)
        const fieldsets = Array.from(form.querySelectorAll('fieldset'));
        const inlines = Array.from(document.querySelectorAll('.inline-group, .inline-related'));
        const panels = fieldsets.concat(inlines).filter(Boolean);
        if (!panels.length) return;

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
      .mimi-tabs-nav { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 15px; }
      .mimi-tab-btn { border: 1px solid #e0e0e0; background: #fff; color: #333; padding: 6px 10px; border-radius: 18px; cursor: pointer; font-weight: 600; transition: all .2s ease; }
      .mimi-tab-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
      .mimi-tab-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-color: transparent; }
      .mimi-tab-panel { display: none; }
      .mimi-tab-panel.active { display: block; }

      /* Ensure no panel is shown by default */
      fieldset, .inline-group, .inline-related {
        display: none !important;
      }
      fieldset.active, .inline-group.active, .inline-related.active {
        display: block !important;
      }
    `;
        document.head.appendChild(style);

        // Create buttons and mark panels
        const buttonById = new Map();
        const panelById = new Map();
        const slugToPanelId = new Map();

        // Try to reuse existing nav links
        const existingNavLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"], a[href^="#"][role="tab"]'));

        panels.forEach((panel, idx) => {
            // Skip truly empty panels
            if (!panel.querySelector('div, p, table, .form-row, .field, .form-horizontal, .inline-related')) return;

            const title = getPanelTitle(panel);
            const panelId = 'mimi-tab-' + idx;
            const slug = norm(title);

            panel.dataset.mimiTabId = panelId;
            panel.classList.add('mimi-tab-panel');
            panelById.set(panelId, panel);
            slugToPanelId.set(slug, panelId);

            // Reuse existing nav-link if its hash matches the slug
            let btn = null;
            const matching = existingNavLinks.find(a => {
                const hash = (a.getAttribute('href') || '').replace('#', '').trim().replace(/-tab$/i, '');
                return norm(hash) === slug;
            });
            if (matching) {
                btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'mimi-tab-btn';
                btn.textContent = matching.textContent.trim();
                tabsNav.appendChild(btn);
            } else {
                btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'mimi-tab-btn';
                btn.textContent = title;
                tabsNav.appendChild(btn);
            }

            btn.dataset.target = panelId;
            btn.dataset.slug = slug;
            buttonById.set(panelId, btn);

            // Make legend clickable too
            const legend = panel.querySelector('legend, h2');
            if (legend) {
                legend.style.cursor = 'pointer';
                legend.addEventListener('click', () => activate(panelId));
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
                history.replaceState(null, '', '#' + slug);
            }
        }

        // Event delegation for clicks on buttons
        tabsNav.addEventListener('click', function (e) {
            const btn = e.target.closest('.mimi-tab-btn');
            if (!btn) return;
            e.preventDefault();
            
            const targetId = btn.dataset.target;
            const slug = btn.dataset.slug || norm(btn.textContent);
            
            // Activate immediately
            activate(targetId);
            
            // Update hash without triggering reload
            if (slug) {
                history.replaceState(null, '', '#' + slug);
            }
        });

        // Function to activate tab by hash
        function activateByHash(hashValue) {
            const clean = decodeURIComponent((hashValue || '').replace('#', '')).trim().replace(/-tab$/i, '');
            const slug = norm(clean);
            const targetId = slugToPanelId.get(slug);
            if (targetId) {
                activate(targetId);
                return true;
            }
            // Fallback by button text
            const match = tabButtons.find(b => (b.dataset.slug || norm(b.textContent)) === slug);
            if (match) {
                activate(match.dataset.target);
                return true;
            }
            return false;
        }

        // Don't activate any tab by default
        // Only activate when user clicks on a tab

        // React to hash changes (e.g., clicking existing anchor links)
        window.addEventListener('hashchange', function () {
            activateByHash(location.hash);
        });

        // Activate the first tab by default if no hash
        if (!activateByHash(location.hash)) {
            const firstId = panels[0].dataset.mimiTabId;
            if (firstId) activate(firstId);
        }

        // Ignore built-in collapse since tabs control visibility
        panels.forEach(p => p.classList.remove('collapse'));
    }

    // Initialize immediately if DOM is already loaded, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMimiTabs);
    } else {
        initMimiTabs();
    }
})();
