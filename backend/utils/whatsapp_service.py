import requests
import os
from django.conf import settings

def send_whatsapp_order_notification(order):
    """
    Sends a WhatsApp notification to the store manager when a new order is placed.
    Manager Number: 07737698219
    """
    manager_phone = "9647737698219"  # Iraq country code + manager number
    
    # Message content in Arabic as requested
    message = (
        f"🔔 *طلب جديد من متجر voro*\n\n"
        f"👤 *الزبون:* {order.customer_name}\n"
        f"💰 *الإجمالي:* {order.total} د.ع\n"
        f"🆔 *رقم الطلب:* #{str(order.id)[:8]}\n"
        f"📍 *العنوان:* {order.shipping_address}\n"
        f"📱 *رقم الهاتف:* {order.phone_number}\n\n"
        f"🔗 *رابط الطلب في لوحة الإدارة:*\n"
        f"https://ecom-parent-project.onrender.com/admin/orders/order/{order.id}/change/"
    )

    # Generic WhatsApp API integration (e.g., UltraMsg, Twilio, or similar)
    # These should be set in .env
    instance_id = os.getenv('WHATSAPP_INSTANCE_ID', 'placeholder')
    token = os.getenv('WHATSAPP_TOKEN', 'placeholder')
    api_url = os.getenv('WHATSAPP_API_URL', f'https://api.ultramsg.com/{instance_id}/messages/chat')

    payload = {
        "token": token,
        "to": manager_phone,
        "body": message,
        "priority": 1,
        "referenceId": str(order.id)
    }

    try:
        if token != 'placeholder':
            response = requests.post(api_url, data=payload, timeout=10)
            return response.json()
        else:
            print(f"WhatsApp Notification (Simulated): To {manager_phone}\n{message}")
            return {"sent": False, "reason": "No token provided"}
    except Exception as e:
        print(f"Error sending WhatsApp notification: {str(e)}")
        return {"sent": False, "error": str(e)}
