# Firebase
import firebase_admin
from firebase_admin import credentials

# Application
from core.settings import settings

# Load cerds
cred_dict = settings.get_firebase_credentials_dict()

# Firebase credentials
cred = credentials.Certificate(cred_dict)

# Initialize Firebase Admin
firebase_admin.initialize_app(cred)
