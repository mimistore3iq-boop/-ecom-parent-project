
// Fixed bottom navigation styled to match the screenshot
// Shows 4 actions: Home, WhatsApp, Call, Top
// - Uses environment variable for WhatsApp phone if available
// - Hidden on md+ screens
const BottomNav = () => {
    const whatsappPhone = process.env.REACT_APP_WHATSAPP_PHONE || '+9647700000000';

    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden z-50">
            <div className="grid grid-cols-4 text-center">
                <a
                    href="/"
                    className="py-3 flex flex-col items-center justify-center text-gray-700 hover:text-primary-600"
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                    </svg>
                    <span className="text-xs">الرئيسية</span>
                </a>

                <a
                    href={`https://wa.me/${whatsappPhone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 flex flex-col items-center justify-center text-gray-700 hover:text-primary-600"
                >
                    <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.52 3.48A11.76 11.76 0 0012.01 0C5.38 0 .01 5.37.01 11.99c0 2.12.55 4.19 1.61 6.01L0 24l6.16-1.6a12 12 0 005.85 1.5h.01c6.62 0 11.99-5.37 11.99-11.99a11.95 11.95 0 00-3.49-8.43zM12.01 22.03h-.01a9.98 9.98 0 01-5.09-1.4l-.36-.21-3.66.95.98-3.57-.24-.37A9.96 9.96 0 012.03 12c0-5.51 4.48-9.99 9.99-9.99 2.67 0 5.18 1.04 7.07 2.93a9.96 9.96 0 012.93 7.06c0 5.51-4.48 9.99-9.99 9.99zm5.47-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.5-1.77-1.68-2.07-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.24-.58-.49-.5-.68-.5-.18 0-.38-.02-.58-.02-.2 0-.53.08-.8.38-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.21 5.07 4.51.71.31 1.27.49 1.7.63.72.23 1.39.2 1.92.12.59-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35z" />
                    </svg>
                    <span className="text-xs">واتس</span>
                </a>

                <a
                    href={`tel:+${whatsappPhone.replace(/[^\d]/g, '')}`}
                    className="py-3 flex flex-col items-center justify-center text-gray-700 hover:text-primary-600"
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a2 2 0 011.788 1.106l1.498 2.995A2 2 0 0112 8v0a2 2 0 01-1.707 1.977l-2.514.419a11.042 11.042 0 006.825 6.825l.419-2.514A2 2 0 0115 13h0a2 2 0 011.899 1.434l1.498 4.494A2 2 0 0116.5 21H19a2 2 0 002-2v-1a16 16 0 00-16-16H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-xs">إتصل بنا</span>
                </a>

                <button
                    onClick={scrollTop}
                    className="py-3 flex flex-col items-center justify-center text-gray-700 hover:text-primary-600"
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-xs">أعلى القائمة</span>
                </button>
            </div>
        </nav>
    );
};

export default BottomNav;