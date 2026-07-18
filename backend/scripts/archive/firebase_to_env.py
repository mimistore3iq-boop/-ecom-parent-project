
import os
import json

# قراءة ملف Firebase
firebase_path = os.path.join(os.path.dirname(__file__), 'firebase', 'ecomproject-a8173-38763797948f.json')

if os.path.exists(firebase_path):
    with open(firebase_path, 'r') as f:
        firebase_data = json.load(f)

    # تحويل البيانات إلى نص JSON
    firebase_json = json.dumps(firebase_data)

    # طباعة المتغير البيئي
    print("FIREBASE_CREDENTIALS_JSON=" + firebase_json)
    print("
انسخ هذا المتغير وأضفه إلى متغيرات البيئة في الاستضافة")
else:
    print("لم يتم العثور على ملف Firebase")
