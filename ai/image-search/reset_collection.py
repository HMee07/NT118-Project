import chromadb
from chromadb.config import Settings
from config import CHROMA_DB_DIR, COLLECTION_NAME

client = chromadb.PersistentClient(
    path=CHROMA_DB_DIR,
    settings=Settings(anonymized_telemetry=False)
)

try:
    client.delete_collection(COLLECTION_NAME)
    print("🗑 Deleted collection:", COLLECTION_NAME)
except Exception as e:
    print("⚠️ Collection not found")

client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

print("✅ Collection recreated")
