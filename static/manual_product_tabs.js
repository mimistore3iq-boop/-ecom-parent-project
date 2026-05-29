/* voro admin tabs — change/add forms only (NOT changelist) */
(function () {
    'use strict';

    function isAdminChangeFormPage() {
        var path = window.location.pathname;
        return /\/add\/?$/.test(path) || /\/\d+\/change\/?$/.test(path);
    }

    if (!isAdminChangeFormPage()) {
        return;
    }

    function fixJazzminUndefined() {
        var idsToFix = [
            'body-small-text', 'footer-small-text', 'sidebar-nav-small-text',
            'jazzmin-theme-chooser', 'theme-condition', 'navbar-small-text',
            'brand-small-text', 'actions-fixed', 'layout-boxed', 'footer-fixed',
            'navbar-fixed', 'no-navbar-border', 'sidebar-nav-flat-style',
            'sidebar-nav-legacy-style', 'sidebar-nav-compact', 'sidebar-nav-child-indent',
            'main-sidebar-disable-hover-focus-auto-expand', 'sidebar-fixed'
        ];

        idsToFix.forEach(function (id) {
            if (!document.getElementById(id)) {
                var dummy = document.createElement('input');
                dummy.id = id;
                dummy.type = 'checkbox';
                dummy.style.display = 'none';
                dummy.className = 'voro-dummy-fix';
                (document.body || document.documentElement).appendChild(dummy);
            }
        });

        window.ui_changes = window.ui_changes || { button_classes: {} };
    }

    function initVoroTabs() {
        var jazzminTabs = document.querySelectorAll('#jazzy-tabs .nav-link, .nav-tabs .nav-link');

        if (jazzminTabs.length > 0) {
            jazzminTabs.forEach(function (tab) {
                tab.addEventListener('click', function (e) {
                    e.preventDefault();
                    var targetId = this.getAttribute('href');
                    if (!targetId || !targetId.startsWith('#')) return;

                    jazzminTabs.forEach(function (t) { t.classList.remove('active'); });
                    this.classList.add('active');

                    var targetEl = document.querySelector(targetId) || document.getElementById(targetId.replace('#', ''));
                    if (!targetEl) return;

                    var tabContent = targetEl.closest('.tab-content') || targetEl.parentElement;
                    if (tabContent) {
                        Array.from(tabContent.children).forEach(function (child) {
                            child.classList.remove('active', 'show');
                            child.style.display = 'none';
                        });
                    }
                    targetEl.classList.add('active', 'show');
                    targetEl.style.display = 'block';
                    targetEl.querySelectorAll('fieldset').forEach(function (f) {
                        f.style.display = 'block';
                    });
                });
            });
            return;
        }

        var form = document.querySelector('#product_form') ||
            document.querySelector('#category_form') ||
            document.querySelector('#content-main form[method="post"]:not(#changelist-form)');
        if (!form || form.id === 'changelist-form') return;

        var sections = Array.from(form.querySelectorAll('fieldset.module, .inline-group'));
        if (sections.length <= 1) return;

        var existing = document.querySelector('.voro-standalone-tabs');
        if (existing) existing.remove();

        var nav = document.createElement('div');
        nav.className = 'voro-standalone-tabs';
        nav.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;padding:12px;background:#f8f9fa;border-radius:12px;border:1px solid #e9ecef;';

        if (!document.getElementById('voro-tab-styles')) {
            var style = document.createElement('style');
            style.id = 'voro-tab-styles';
            style.innerHTML = [
                '.voro-tab-btn{padding:10px 20px;border-radius:8px;border:1px solid #dee2e6;background:#fff;color:#495057;font-weight:600;cursor:pointer;font-size:13px}',
                '.voro-tab-btn.active{background:#6f42c1!important;color:#fff!important;border-color:#6f42c1!important}',
                '.voro-hide{display:none!important}',
                '.voro-show{display:block!important}'
            ].join('');
            document.head.appendChild(style);
        }

        var buttons = [];
        sections.forEach(function (sec, i) {
            var h2 = sec.querySelector('h2, legend');
            var title = h2 ? h2.innerText.trim() : 'القسم ' + (i + 1);
            title = title.replace(/^(Show|Hide|إظهار|إخفاء)\s+/i, '');

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'voro-tab-btn' + (i === 0 ? ' active' : '');
            btn.innerText = title;
            btn.onclick = function (e) {
                e.preventDefault();
                activate(i);
            };
            nav.appendChild(btn);
            buttons.push(btn);
            sec.classList.add(i === 0 ? 'voro-show' : 'voro-hide');
        });

        function activate(idx) {
            sections.forEach(function (s, i) {
                var on = i === idx;
                s.classList.toggle('voro-hide', !on);
                s.classList.toggle('voro-show', on);
                buttons[i].classList.toggle('active', on);
            });
        }

        form.parentNode.insertBefore(nav, form);
    }

    function boot() {
        fixJazzminUndefined();
        initVoroTabs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
