/*
  Minimal top bar similar to the screenshot style
  - Small links: Home, Products, WhatsApp, Call
  - Uses REACT_APP_WHATSAPP_PHONE for both WhatsApp and tel link
  - RTL friendly and mobile-first
*/

const TopBar = () => {
    const rawPhone = process.env.REACT_APP_WHATSAPP_PHONE || '9647700000000';
    const phoneDigits = rawPhone.replace(/[^\d]/g, '');
    const whatsappHref = `https://wa.me/${phoneDigits}`;
    const telHref = `tel:+${phoneDigits}`;

    return (
        <div className="bg-gray-100 text-gray-700 text-[11px] sm:text-xs border-b" dir="rtl">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="h-8 flex items-center justify-between">
                    {/* Left side quick links (in RTL this visually sits on the right) */}
                    <nav className="flex items-center gap-2 sm:gap-3 justify-end">
                        <a href="/" className="flex items-center gap-1 hover:text-primary-600">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
                            </svg>
                            <span>الرئيسية</span>
                        </a>
                        <a href="#products" className="flex items-center gap-1 hover:text-primary-600">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                            </svg>
                            <span>المنتجات</span>
                        </a>
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.52 3.48A11.76 11.76 0 0012.01 0C5.38 0 .01 5.37.01 11.99c0 2.12.55 4.19 1.61 6.01L0 24l6.16-1.6a12 12 0 005.85 1.5h.01c6.62 0 11.99-5.37 11.99-11.99a11.95 11.95 0 00-3.49-8.43zM12.01 22.03h-.01a9.98 9.98 0 01-5.09-1.4l-.36-.21-3.66.95.98-3.57-.24-.37A9.96 9.96 0 012.03 12c0-5.51 4.48-9.99 9.99-9.99 2.67 0 5.18 1.04 7.07 2.93a9.96 9.96 0 012.93 7.06c0 5.51-4.48 9.99-9.99 9.99zm5.47-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.5-1.77-1.68-2.07-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.24-.58-.49-.5-.68-.5-.18 0-.38-.02-.58-.02-.2 0-.53.08-.8.38-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.21 5.07 4.51.71.31 1.27.49 1.7.63.72.23 1.39.2 1.92.12.59-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35z" />
                            </svg>
                            <span>واتساب</span>
                        </a>
                        <a href={telHref} className="flex items-center gap-1 hover:text-primary-600">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a2 2 0 011.788 1.106l1.498 2.995A2 2 0 0112 8v0a2 2 0 01-1.707 1.977l-2.514.419a11.042 11.042 0 006.825 6.825l.419-2.514A2 2 0 0115 13h0a2 2 0 011.899 1.434l1.498 4.494A2 2 0 0116.5 21H19a2 2 0 002-2v-1a16 16 0 00-16-16H5a2 2 0 00-2 2z" />
                            </svg>
                            <span>اتصال</span>
                        </a>
                    </nav>

                    {/* Right side placeholder / brand */}
                    <div className="hidden sm:flex items-center gap-2 text-gray-500">
                        <span>هلا بك في</span>
                        <span className="font-semibold">voro</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;