from pymongo import MongoClient
from django.conf import settings

client = MongoClient(
    settings.MONGO_URI,
    serverSelectionTimeoutMS=5000,
    retryWrites=True
)
db = client.get_default_database()
justifications = db.justifications  # Collection { disease: str, texte: str }
