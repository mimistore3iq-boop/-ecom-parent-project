/**
 * صورة بديلة للمنتجات تُرسم من داخل الصفحة نفسها (data URI).
 *
 * سابقاً كان البديل ملفاً على الخادم (‎/placeholder-product.png‎)، وهو غير موجود
 * أصلاً — فكان الكود يستبدل صورة مكسورة (404) بصورة مكسورة أخرى (404)، ويرى
 * الزبون أيقونة الكسر في المتصفح. رابط data لا يمكن أن يفشل تحميله إطلاقاً:
 * لا شبكة، ولا نطاق، ولا ملف يمكن أن يضيع.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#f4f4f5"/>
  <g fill="none" stroke="#d4d4d8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M150 96 L196 122 L196 174 L150 200 L104 174 L104 122 Z"/>
    <path d="M104 122 L150 148 L196 122"/>
    <path d="M150 148 L150 200"/>
  </g>
</svg>`;

// encodeURIComponent أأمن من btoa هنا: الأخير يتعثّر بأي محرف غير Latin-1
export const PRODUCT_IMAGE_FALLBACK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export default PRODUCT_IMAGE_FALLBACK;
