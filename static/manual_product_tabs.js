
/* 🚀 voro Admin Tabs: Super Robust & Error-Fixing Version */
(function() {
    console.log("🚀 voro Tabs: Initializing...");

    // 🛠️ FIX: منع انهيار المتصفح بسبب أخطاء Jazzmin الأصلية في سطر 303
    // نقوم بتعطيل الوصول المباشر للعناصر غير الموجودة
    try {
        const originalGet = jQuery.fn.get;
        jQuery.fn.get = function(index) {
            const result = originalGet.apply(this, arguments);
            if (index === 0 && !result && this.selector && this.selector.includes('small-text')) {
                // نرجع عنصر وهمي لتجنب Crash
                return { checked: false };
            }
            return result;
        };
    } catch(e) { console.log("voro: Safety patch failed, skipping."); }

    function initVoroTabs() {
        const path = window.location.pathname;
        if (!(path.includes('/products/product/') || path.includes('/products/banner/'))) return;
        
        // استهداف الأدمن
        const mainForm = document.querySelector('#content-main form') || document.querySelector('#product_form');
        if (!mainForm) return;

        // جمع كافة الأقسام (Fieldsets و Inlines)
        const fieldsets = Array.from(mainForm.querySelectorAll('fieldset.module'));
        const inlines = Array.from(mainForm.querySelectorAll('.inline-group'));
        const panels = [...fieldsets, ...inlines].filter(p => {
            return p.querySelector('h2, legend') || p.offsetHeight > 0;
        });

        if (panels.length <= 1) return;

        // حذف القديم
        document.querySelectorAll('.voro-tabs-nav').forEach(el => el.remove());

        const tabsNav = document.createElement('div');
        tabsNav.className = 'voro-tabs-nav';
        
        // التنسيقات
        if (!document.getElementById('voro-tabs-style')) {
            const style = document.createElement('style');
            style.id = 'voro-tabs-style';
            style.innerHTML = `
                .voro-tabs-nav {
                    display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 25px;
                    padding: 15px; background: #fff; border-radius: 12px;
                    border: 1px solid #dee2e6; position: sticky; top: 0; z-index: 1000;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
                }
                .voro-tab-btn {
                    padding: 12px 22px; border-radius: 10px; border: 1px solid #e2e8f0;
                    background: #f8fafc; color: #64748b; font-weight: 700;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .voro-tab-btn:hover { background: #f1f5f9; color: #1e293b; transform: translateY(-1px); }
                .voro-tab-btn.active {
                    background: #7c3aed; color: white; border-color: #7c3aed;
                    box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3);
                }
                .voro-panel-hidden { display: none !important; }
                .voro-panel-visible { display: block !important; animation: voroFadeIn 0.4s ease-out; }
                @keyframes voroFadeIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `;
            document.head.appendChild(style);
        }

        const buttons = [];
        panels.forEach((panel, index) => {
            const header = panel.querySelector('h2, legend');
            let title = header ? header.innerText.trim() : `Section ${index + 1}`;
            title = title.replace(/^(إظهار|إخفاء|Show|Hide)\s+/i, '');

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'voro-tab-btn';
            btn.innerText = title;
            
            btn.onclick = function(e) {
                e.preventDefault();
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
                window.scrollTo({ top: mainForm.offsetTop - 100, behavior: 'smooth' });
            };

            tabsNav.appendChild(btn);
            buttons.push(btn);

            if (index === 0) {
                panel.classList.add('voro-panel-visible');
                btn.classList.add('active');
            } else {
                panel.classList.add('voro-panel-hidden');
            }
        });

        mainForm.insertBefore(tabsNav, panels[0]);
    }

    // الانتظار قليلاً للتأكد من تحميل jQuery و Jazzmin
    setTimeout(initVoroTabs, 300);
    window.addEventListener('load', () => setTimeout(initVoroTabs, 800));
})();
