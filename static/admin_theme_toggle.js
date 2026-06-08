/**
 * voro Admin — dark / light theme toggle
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'voro-admin-theme';

    function getTheme() {
        return document.documentElement.getAttribute('data-voro-theme') || 'light';
    }

    function setTheme(theme) {
        var next = theme === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-voro-theme', next);
        localStorage.setItem(STORAGE_KEY, next);
        updateToggleUi(next);
        updateMetaThemeColor(next);
    }

    function updateMetaThemeColor(theme) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#09090b' : '#ffffff');
        }
    }

    function updateToggleUi(theme) {
        document.querySelectorAll('.voro-theme-toggle').forEach(function (btn) {
            var moon = btn.querySelector('.voro-icon-moon');
            var sun = btn.querySelector('.voro-icon-sun');
            var label = btn.querySelector('.voro-theme-label');
            if (moon) moon.style.display = theme === 'dark' ? 'none' : '';
            if (sun) sun.style.display = theme === 'dark' ? '' : 'none';
            if (label) {
                label.textContent = theme === 'dark' ? 'نهاري' : 'ليلي';
            }
            btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            btn.title = theme === 'dark' ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي';
        });
    }

    function toggleTheme() {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    function bindToggle() {
        document.querySelectorAll('.voro-theme-toggle').forEach(function (btn) {
            if (btn.dataset.bound === '1') return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                toggleTheme();
            });
        });
        updateToggleUi(getTheme());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindToggle);
    } else {
        bindToggle();
    }
})();
