import requests
import os
import json

def send_telegram_order_notification(order):
    """
    Sends a Telegram notification to the store manager when a new order is placed.
    Includes all product images and formats prices properly.
    """
    bot_token = "8475984956:AAGJskTmrPOZ4swaQPtFLbJ3n0XJ6ttzw-w"
    chat_id = "8905195821"
    
    # Message content in Arabic
    items_text = ""
    product_images = []
    
    for item in order.items.all():
        # Format item price
        item_price_formatted = f"{int(float(item.price)):,}".replace(',', ' ') + " دينار عراقي"
        items_text += f"- {item.product_name} (العدد: {item.quantity}, السعر: {item_price_formatted})\n"
        
        # Collect product image URLs
        image_url = None
        if hasattr(item.product, 'main_image') and item.product.main_image:
            image_url = item.product.main_image
        elif hasattr(item.product, 'image') and item.product.image:
            image_url = item.product.image
        elif hasattr(item.product, 'main_image_url') and item.product.main_image_url:
            image_url = item.product.main_image_url
            
        if image_url and image_url not in product_images:
            product_images.append(image_url)

    # Format total price
    total_formatted = f"{int(float(order.total)):,}".replace(',', ' ') + " دينار عراقي"

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
        if len(product_images) > 1:
            # Send multiple images as a group
            api_url = f"https://api.telegram.org/bot{bot_token}/sendMediaGroup"
            media = []
            for i, img_url in enumerate(product_images):
                media_item = {
                    "type": "photo",
                    "media": img_url
                }
                # Attach caption only to the first image
                if i == 0:
                    media_item["caption"] = message
                    media_item["parse_mode"] = "Markdown"
                media.append(media_item)
            
            payload = {
                "chat_id": chat_id,
                "media": json.dumps(media)
            }
            response = requests.post(api_url, data=payload, timeout=15)
        elif len(product_images) == 1:
            # Send single image
            api_url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
            payload = {
                "chat_id": chat_id,
                "photo": product_images[0],
                "caption": message,
                "parse_mode": "Markdown"
            }
            response = requests.post(api_url, data=payload, timeout=10)
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
