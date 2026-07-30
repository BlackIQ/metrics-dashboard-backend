# Firebase
import firebase_admin
from firebase_admin import credentials

# Application
from core.settings import settings

# Firebase credentials
cred = credentials.Certificate(settings.firebase_cerds)

# Initialize Firebase Admin
firebase_admin.initialize_app(cred)
