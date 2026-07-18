
import os
import json
from django.conf import settings
import firebase_admin
from firebase_admin import credentials

def initialize_firebase():
    """
    تهيئة Firebase باستخدام بيانات الاعتماد من متغير البيئة
    """
    # التحقق مما إذا كان Firebase قد تم تهيئته بالفعل
    if firebase_admin._apps:
        return

    # الحصول على بيانات الاعتماد من متغير البيئة
    firebase_credentials_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')

    if firebase_credentials_json:
        # استخدام بيانات الاعتماد من متغير البيئة
        cred_dict = json.loads(firebase_credentials_json)
        cred = credentials.Certificate(cred_dict)
    else:
        # استخدام ملف الاعتماد كخيار بديل
        cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', None)
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            # إذا لم يتم العثور على بيانات الاعتماد، لا تهيئ Firebase
            print("لم يتم العثور على بيانات اعتماد Firebase")
            return

    # تهيئة Firebase
    firebase_admin.initialize_app(cred)
