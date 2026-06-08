/**
 * Format product list price/discount as: 45.000 الف دينار عراقي
 */
(function () {
    'use strict';

    var SUFFIX = ' الف دينار عراقي';

    function parseRaw(value) {
        if (value == null) return 0;
        var s = String(value)
            .replace(SUFFIX, '')
            .replace(/[^\d.]/g, '')
            .replace(/\.(?=.*\.)/g, '');
        var n = parseFloat(s);
        return isNaN(n) ? 0 : Math.round(n);
    }

    function formatDots(num) {
        var n = Math.max(0, Math.round(num));
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function formatDisplay(num) {
        if (!num || num <= 0) return '';
        return formatDots(num) + SUFFIX;
    }

    function bindIqdInput(input) {
        if (!input || input.dataset.iqdBound === '1') return;
        input.dataset.iqdBound = '1';
        input.classList.add('voro-iqd-input');
        input.type = 'text';
        input.setAttribute('dir', 'rtl');
        input.setAttribute('autocomplete', 'off');

        var raw = parseRaw(input.value);
        input.dataset.rawValue = String(raw);

        function showFormatted() {
            if (document.activeElement === input) return;
            raw = parseRaw(input.dataset.rawValue || input.value);
            input.value = formatDisplay(raw);
        }

        function showEditing() {
            raw = parseRaw(input.dataset.rawValue || input.value);
            input.value = raw > 0 ? String(raw) : '';
            input.select();
        }

        input.addEventListener('focus', showEditing);
        input.addEventListener('blur', function () {
            raw = parseRaw(input.value);
            input.dataset.rawValue = String(raw);
            showFormatted();
        });

        showFormatted();
    }

    function bindFormSubmit() {
        var form = document.getElementById('changelist-form');
        if (!form || form.dataset.iqdSubmitBound === '1') return;
        form.dataset.iqdSubmitBound = '1';
        form.addEventListener('submit', function () {
            form.querySelectorAll('.voro-iqd-input').forEach(function (input) {
                var raw = parseRaw(input.dataset.rawValue || input.value);
                input.value = raw > 0 ? String(raw) : '0';
            });
        });
    }

    function init() {
        document.querySelectorAll(
            '#result_list td.field-price input, #result_list td.field-discount_amount input'
        ).forEach(bindIqdInput);
        bindFormSubmit();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    setTimeout(init, 500);
    setTimeout(init, 1500);
})();
