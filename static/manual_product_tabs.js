
/* 🚀 voro Super Fix: Resolving JS errors and enabling Tabs */
(function() {
    // 1. إصلاح خطأ السطر 303 في Jazzmin ui-builder.js
    window.ui_changes = window.ui_changes || {'button_classes': {}};
    
    // 2. سكربت التبويبات (Tabs) المطور - يدعم Jazzmin والتبويبات المخصصة
    function initVoroTabs() {
        const path = window.location.pathname;
        // إضافة دعم لواجهة الطلبات (orders) والكوبونات (coupon)
        if (!(path.includes('/product/') || path.includes('/category/') || path.includes('/banner/') || path.includes('/orders/') || path.includes('/coupon/'))) return;
        
        // دعم أزرار التبويبات في Jazzmin (الموجودة في الكود الذي أرسلته)
        const jazzminTabs = document.querySelectorAll('#jazzy-tabs .nav-link, .nav-tabs .nav-link');
        
        if (jazzminTabs.length > 0) {
            console.log('Found Jazzmin tabs, attaching listeners...');
            jazzminTabs.forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    console.log('Tab clicked:', targetId);
                    
                    if (targetId && targetId.startsWith('#')) {
                        // إزالة الحالة النشطة من جميع الأزرار
                        jazzminTabs.forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                        
                        // إخفاء كل المحتوى وإظهار المستهدف
                        const targetEl = document.querySelector(targetId) || document.getElementById(targetId.replace('#', ''));
                        if (targetEl) {
                            console.log('Target element found:', targetId);
                            // إخفاء جميع التبويبات الأخرى في نفس الحاوية
                            const tabContent = targetEl.closest('.tab-content') || targetEl.parentElement;
                            if (tabContent) {
                                Array.from(tabContent.children).forEach(child => {
                                    child.classList.remove('active', 'show');
                                    child.style.display = 'none';
                                });
                            }
                            targetEl.classList.add('active', 'show');
                            targetEl.style.display = 'block';
                            
                            // ضمان ظهور الحقول داخل التبويب
                            const fieldsets = targetEl.querySelectorAll('fieldset');
                            fieldsets.forEach(f => f.style.display = 'block');
                        } else {
                            console.warn('Target element NOT found:', targetId);
                        }
                    }
                });
            });
            // لا تكمل إذا وجدت تبويبات جازمين وعملت بنجاح
            return;
        }

        const form = document.querySelector('#content-main form') || document.querySelector('#product_form') || document.querySelector('#category_form');
        if (!form) return;
        
        // ... بقية الكود للتبويبات المخصصة في حال عدم وجود جازمين ...

        // البحث عن الأقسام لإنشاء التبويبات المخصصة إذا لزم الأمر
        const sections = Array.from(form.querySelectorAll('fieldset.module, .inline-group'));
        if (sections.length <= 1) return;

        // إزالة التبويبات القديمة
        const existing = document.querySelector('.voro-standalone-tabs');
        if (existing) existing.remove();

        const nav = document.createElement('div');
        nav.className = 'voro-standalone-tabs';
        nav.style.cssText = `
            display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
            padding: 12px; background: #f8f9fa; border-radius: 12px;
            border: 1px solid #e9ecef; position: sticky; top: 0; z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        `;

        if (!document.getElementById('voro-tab-styles')) {
            const style = document.createElement('style');
            style.id = 'voro-tab-styles';
            style.innerHTML = `
                .voro-tab-btn {
                    padding: 10px 20px; border-radius: 8px; border: 1px solid #dee2e6;
                    background: #fff; color: #495057; font-weight: 600; cursor: pointer;
                    transition: all 0.2s; font-size: 13px;
                }
                .voro-tab-btn:hover { background: #e9ecef; border-color: #adb5bd; }
                .voro-tab-btn.active {
                    background: #6f42c1 !important; color: #fff !important; 
                    border-color: #6f42c1 !important; box-shadow: 0 4px 10px rgba(111,66,193,0.3);
                }
                .voro-hide { display: none !important; }
                .voro-show { display: block !important; animation: voroFade 0.3s ease-out; }
                @keyframes voroFade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `;
            document.head.appendChild(style);
        }

        const buttons = [];
        sections.forEach((sec, i) => {
            const h2 = sec.querySelector('h2, legend');
            let title = h2 ? h2.innerText.trim() : `القسم ${i+1}`;
            title = title.replace(/^(Show|Hide|إظهار|إخفاء)\s+/i, '');

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'voro-tab-btn';
            btn.innerText = title;
            btn.onclick = (e) => {
                e.preventDefault();
                activate(i);
            };
            nav.appendChild(btn);
            buttons.push(btn);

            if (i === 0) {
                sec.classList.add('voro-show');
                btn.classList.add('active');
            } else {
                sec.classList.add('voro-hide');
            }
        });

        function activate(idx) {
            sections.forEach((s, i) => {
                if (i === idx) {
                    s.classList.remove('voro-hide');
                    s.classList.add('voro-show');
                    buttons[i].classList.add('active');
                } else {
                    s.classList.remove('voro-show');
                    s.classList.add('voro-hide');
                    buttons[i].classList.remove('active');
                }
            });
            window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
        }

        form.parentNode.insertBefore(nav, form);
    }

    // التشغيل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVoroTabs);
    } else {
        initVoroTabs();
    }
    
    // محاكاة العناصر المفقودة لخطأ 303 و 265
    setInterval(() => {
        if (window.location.pathname.includes('/admin/')) {
            ['body-small-text', 'footer-small-text', 'sidebar-nav-small-text', 'jazzmin-theme-chooser', 'theme-condition', 'navbar-small-text', 'brand-small-text'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) {
                    const dummy = document.createElement('input');
                    dummy.id = id;
                    dummy.type = 'checkbox';
                    dummy.style.display = 'none';
                    dummy.className = 'voro-dummy-fix';
                    document.body.appendChild(dummy);
                }
            });
        }
    }, 1000);

})();
