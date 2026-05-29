import requests
import os

def send_telegram_order_notification(order):
    """
    Sends a Telegram notification to the store manager when a new order is placed.
    """
    bot_token = "8475984956:AAGJskTmrPOZ4swaQPtFLbJ3n0XJ6ttzw-w"
    chat_id = "8905195821"
    
    # Message content in Arabic
    items_text = ""
    for item in order.items.all():
        items_text += f"- {item.product_name} (العدد: {item.quantity}, السعر: {item.price} د.ع)\n"

    message = (
        f"🔔 *تم استلام طلب جديد*\n\n"
        f"👤 *الزبون:* {order.customer_name}\n"
        f"📱 *رقم الهاتف:* {order.customer_phone}\n"
        f"📍 *المحافظة:* {order.governorate}\n"
        f"🏠 *العنوان:* {order.customer_address}\n"
        f"💰 *المجموع الكلي:* {order.total} د.ع\n\n"
        f"📦 *المنتجات:*\n{items_text}\n"
        f"🔗 *رابط الطلب في لوحة الإدارة:*\n"
        f"https://ecom-parent-project.onrender.com/admin/orders/order/{order.id}/change/"
    )

    api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        response = requests.post(api_url, data=payload, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Error sending Telegram notification: {str(e)}")
        return {"ok": False, "error": str(e)}
