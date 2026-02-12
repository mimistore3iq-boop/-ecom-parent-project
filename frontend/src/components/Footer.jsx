import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">voro</h3>
            <p className="text-gray-300">
              متجرك الإلكتروني المفضل للحصول على أفضل المنتجات بأسعار مميزة
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">المنتجات</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
              <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">سياسة الإرجاع</a></li>
              <li><a href="#" className="hover:text-white transition-colors">الشحن والتوصيل</a></li>
              <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-white transition-colors">الدعم الفني</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">تواصل معنا</h4>
            <div className="space-y-2 text-gray-300">
              <a href="tel:+96407737698219" className="hover:text-white transition-colors block">📞 07737698219</a>
              <a href="https://wa.me/9647737698219" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">💬 واتساب</a>
              <a href="https://t.me/mimi_store10" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">📱 تيليجرام</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 voro. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
