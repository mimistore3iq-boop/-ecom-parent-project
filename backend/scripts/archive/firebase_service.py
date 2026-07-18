import firebase_admin
from firebase_admin import credentials, messaging
import os
import json

# Initialize Firebase
def initialize_firebase():
    try:
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # Get the path to the service account key
            firebase_key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'firebase', 'ecomproject-a8173-38763797948f.json')

            # Initialize Firebase Admin with the service account
            cred = credentials.Certificate(firebase_key_path)
            firebase_admin.initialize_app(cred)

            print("Firebase initialized successfully")
            return True
        else:
            print("Firebase already initialized")
            return True
    except Exception as e:
        print(f"Error initializing Firebase: {str(e)}")
        return False

# Send notification to a specific device
def send_notification_to_device(token, title, body, data=None):
    try:
        # Create a message
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )

        # Send the message
        response = messaging.send(message)
        print(f"Successfully sent message: {response}")
        return True
    except Exception as e:
        print(f"Error sending notification: {str(e)}")
        return False

# Send notification to a topic
def send_notification_to_topic(topic, title, body, data=None):
    try:
        # Create a message
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            topic=topic,
        )

        # Send the message
        response = messaging.send(message)
        print(f"Successfully sent message to topic: {response}")
        return True
    except Exception as e:
        print(f"Error sending notification to topic: {str(e)}")
        return False

# Subscribe a device to a topic
def subscribe_to_topic(tokens, topic):
    try:
        # Subscribe the devices to the topic
        response = messaging.subscribe_to_topic(tokens, topic)
        print(f"Successfully subscribed to topic: {response}")
        return True
    except Exception as e:
        print(f"Error subscribing to topic: {str(e)}")
        return False
