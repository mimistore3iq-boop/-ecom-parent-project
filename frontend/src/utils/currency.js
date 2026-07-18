// Centralized currency formatting for Iraqi Dinar (IQD)
// Reads optional overrides from environment variables
// REACT_APP_CURRENCY_SYMBOL, REACT_APP_CURRENCY_CODE, REACT_APP_FREE_SHIPPING_THRESHOLD

const SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL || 'د.ع';
const CODE = process.env.REACT_APP_CURRENCY_CODE || 'IQD';

// Default threshold: 120,000 IQD (can be overridden via env)
const FREE_SHIPPING_THRESHOLD = Number(
    process.env.REACT_APP_FREE_SHIPPING_THRESHOLD || 120000
);

// Simple formatter: IQD has no minor units typically, but keep 2 decimals if needed
export function formatCurrency(value, { withCode = false } = {}) {
    const num = Number(value || 0);
    const formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return withCode ? `${formatted} ${CODE}` : `${formatted} ${SYMBOL}`;
}

export function getFreeShippingThreshold() {
    return FREE_SHIPPING_THRESHOLD;
}

/**
 * حساب رسوم التوصيل - رسوم ثابتة 5,000 د.ع
 * @param {number} totalWeight - الوزن الإجمالي بالكيلوغرام (غير مستخدم حالياً)
 * @param {number} subtotal - المجموع الفرعي للطلب
 * @returns {number} - رسوم التوصيل بالدينار العراقي
 */
export function calculateShippingFee(totalWeight, subtotal) {
    // إذا كان المجموع أكثر من عتبة الشحن المجاني (120,000 د.ع)، الشحن مجاني
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        return 0;
    }
    
    // رسوم توصيل ثابتة: 5,000 د.ع
    return 5000;
}