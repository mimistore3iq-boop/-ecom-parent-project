
/* 🚀 voro Admin Tabs: Super Robust Version for Jazzmin */
(function() {
    console.log("🚀 voro Tabs: Initializing...");

    function initVoroTabs() {
        // التحقق من الصفحة
        const path = window.location.pathname;
        if (!(path.includes('/products/product/') || path.includes('/products/banner/'))) return;
        if (!(path.includes('/add/') || /\/\d+\/change\//.test(path))) return;

        // استهداف النموذج الرئيسي في Jazzmin
        const mainForm = document.querySelector('#content-main form') || document.querySelector('#product_form');
        if (!mainForm) {
            console.log("🚀 voro Tabs: Form not found.");
            return;
        }

        // جمع كافة الأقسام (Fieldsets و Inlines)
        const fieldsets = Array.from(mainForm.querySelectorAll('fieldset.module'));
        const inlines = Array.from(mainForm.querySelectorAll('.inline-group'));
        const panels = [...fieldsets, ...inlines].filter(p => {
            // تصفية الأقسام الفارغة أو المخفية أصلاً
            return p.offsetHeight > 0 || p.querySelector('h2, legend');
        });

        if (panels.length <= 1) return;

        // إزالة أي حاوية تبويبات سابقة إذا وجدت
        const oldNav = document.querySelector('.voro-tabs-nav');
        if (oldNav) oldNav.remove();

        // إنشاء حاوية التبويبات
        const tabsNav = document.createElement('div');
        tabsNav.className = 'voro-tabs-nav';
        
        // التنسيقات
        if (!document.getElementById('voro-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'voro-tabs-style';
            style.innerHTML = `
                .voro-tabs-nav {
                    display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
                    padding: 12px; background: #fff; border-radius: 12px;
                    border: 1px solid #dee2e6; position: sticky; top: 0; z-index: 999;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .voro-tab-btn {
                    padding: 10px 18px; border-radius: 8px; border: 1px solid #e9ecef;
                    background: #f8f9fa; color: #495057; font-weight: 600;
                    cursor: pointer; transition: all 0.2s ease; font-size: 13px;
                }
                .voro-tab-btn:hover { background: #e9ecef; }
                .voro-tab-btn.active {
                    background: #6f42c1; color: white; border-color: #6f42c1;
                    box-shadow: 0 4px 10px rgba(111, 66, 193, 0.3);
                }
                .voro-panel-hidden { display: none !important; }
                .voro-panel-visible { display: block !important; animation: voroIn 0.3s ease; }
                @keyframes voroIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `;
            document.head.appendChild(style);
        }

        const buttons = [];

        panels.forEach((panel, index) => {
            // استخراج العنوان بشكل صحيح
            const header = panel.querySelector('h2, legend');
            let title = header ? header.innerText.trim() : `قسم ${index + 1}`;
            title = title.replace(/^(إظهار|إخفاء|Show|Hide)\s+/i, '');

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'voro-tab-btn';
            btn.innerText = title;
            
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                activateTab(index);
            });

            tabsNav.appendChild(btn);
            buttons.push(btn);

            // الحالة الافتراضية
            if (index === 0) {
                panel.classList.add('voro-panel-visible');
                btn.classList.add('active');
            } else {
                panel.classList.add('voro-panel-hidden');
            }
        });

        function activateTab(idx) {
            panels.forEach((p, i) => {
                if (i === idx) {
                    p.classList.remove('voro-panel-hidden');
                    p.classList.add('voro-panel-visible');
                    buttons[i].classList.add('active');
                } else {
                    p.classList.remove('voro-panel-visible');
                    p.classList.add('voro-panel-hidden');
                    buttons[i].classList.remove('active');
                }
            });
            // التمرير لأعلى النموذج
            const topPos = mainForm.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top: topPos, behavior: 'smooth' });
        }

        // إدخال التبويبات قبل أول قسم
        panels[0].parentNode.insertBefore(tabsNav, panels[0]);
        console.log("🚀 voro Tabs: Ready!");
    }

    // التنفيذ عند تحميل الصفحة أو تبديل المحتوى
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVoroTabs);
    } else {
        initVoroTabs();
    }

    // إعادة التشغيل في حالة وجود AJAX (اختياري لبعض قوالب أدمن)
    window.addEventListener('load', initVoroTabs);
})();
