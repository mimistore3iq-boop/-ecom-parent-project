/**
 * Fix Jazzmin fieldset tabs (Bootstrap 4) — banner, coupon, product add/change
 */
(function () {
    'use strict';

    function initJazzyTabs() {
        var tabs = document.getElementById('jazzy-tabs');
        if (!tabs || tabs.dataset.voroTabsReady === '1') return;

        var jQuery = window.jQuery || window.django?.jQuery;
        if (!jQuery) return;

        tabs.dataset.voroTabsReady = '1';

        jQuery(tabs).find('.nav-link[href^="#"]').on('click', function (e) {
            e.preventDefault();
            jQuery(this).tab('show');
        });

        /* Select2 on changelist inline selects freezes mobile — use native dropdowns */
        jQuery('#result_list select').each(function () {
            try {
                if (jQuery(this).data('select2')) {
                    jQuery(this).select2('destroy');
                }
            } catch (err) { /* ignore */ }
        });
    }

    function boot() {
        initJazzyTabs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    /* Jazzmin change_form.js may bind after us */
    setTimeout(boot, 300);
    setTimeout(boot, 800);
})();
