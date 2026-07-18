import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Send } from 'lucide-react';
import voroLogo from '../assets/voro_logo.png';

const Footer = () => {
  // سنة الحقوق تتحدّث تلقائياً كل سنة
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f7f7f8] text-gray-600 border-t border-gray-200">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* الهوية */}
          <div>
            <img src={voroLogo} alt="voro" className="h-8 w-auto mb-4 select-none" draggable="false" />
            <p className="text-sm leading-relaxed text-gray-500">
              متجرك الإلكتروني المفضل للحصول على أفضل المنتجات بأسعار مميزة
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-black transition-colors">الرئيسية</Link></li>
              <li><Link to="/categories" className="hover:text-black transition-colors">المنتجات</Link></li>
              <li><a href="#" className="hover:text-black transition-colors">من نحن</a></li>
              <li><a href="#" className="hover:text-black transition-colors">اتصل بنا</a></li>
            </ul>
          </div>

          {/* خدمة العملاء */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">خدمة العملاء</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-black transition-colors">سياسة الإرجاع</a></li>
              <li><a href="#" className="hover:text-black transition-colors">الشحن والتوصيل</a></li>
              <li><a href="#" className="hover:text-black transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-black transition-colors">الدعم الفني</a></li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">تواصل معنا</h4>
            <div className="space-y-2.5 text-sm">
              <a href="tel:+9647737698219" className="hover:text-black transition-colors flex items-center gap-2"><Phone className="h-4 w-4" /> 07737698219</a>
              <a href="https://wa.me/9647737698219" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors flex items-center gap-2"><MessageCircle className="h-4 w-4" /> واتساب</a>
              <a href="https://t.me/voro_store" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors flex items-center gap-2"><Send className="h-4 w-4" /> تيليجرام</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>© {year} voro. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
