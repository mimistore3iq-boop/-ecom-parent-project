import requests
import os

def send_telegram_order_notification(order):
    """
    Sends a Telegram notification to the store manager when a new order is placed.
    Includes an image if available and formats prices properly.
    """
    bot_token = "8475984956:AAGJskTmrPOZ4swaQPtFLbJ3n0XJ6ttzw-w"
    chat_id = "8905195821"
    
    # Message content in Arabic
    items_text = ""
    product_image_url = None
    
    for item in order.items.all():
        # Format item price
        item_price_formatted = f"{int(float(item.price)):,} دينار عراقي".replace(',', '.')
        items_text += f"- {item.product_name} (العدد: {item.quantity}, السعر: {item_price_formatted})\n"
        
        # Try to get the first available product image URL
        if not product_image_url:
            if hasattr(item.product, 'main_image') and item.product.main_image:
                product_image_url = item.product.main_image
            elif hasattr(item.product, 'image') and item.product.image:
                product_image_url = item.product.image
            elif hasattr(item.product, 'main_image_url') and item.product.main_image_url:
                product_image_url = item.product.main_image_url

    # Format total price
    total_formatted = f"{int(float(order.total)):,} دينار عراقي".replace(',', '.')

    message = (
        f"🔔 *تم استلام طلب جديد*\n\n"
        f"👤 *الزبون:* {order.customer_name}\n"
        f"📱 *رقم الهاتف:* {order.customer_phone}\n"
        f"📍 *المحافظة:* {order.governorate}\n"
        f"🏠 *العنوان:* {order.customer_address}\n"
        f"💰 *المجموع الكلي:* {total_formatted}\n\n"
        f"📦 *المنتجات:*\n{items_text}\n"
        f"🔗 *رابط الطلب في لوحة الإدارة:*\n"
        f"https://ecom-parent-project.onrender.com/admin/orders/order/{order.id}/change/"
    )

    try:
        if product_image_url:
            # Send as photo if we have an image
            api_url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
            payload = {
                "chat_id": chat_id,
                "photo": product_image_url,
                "caption": message,
                "parse_mode": "Markdown"
            }
        else:
            # Fallback to sendMessage if no image
            api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "Markdown"
            }
            
        response = requests.post(api_url, data=payload, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Error sending Telegram notification: {str(e)}")
        return {"ok": False, "error": str(e)}
