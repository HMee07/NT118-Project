import chromadb
from chromadb.config import Settings
from config import CHROMA_DB_DIR, COLLECTION_NAME

client = chromadb.PersistentClient(
    path=CHROMA_DB_DIR,
    settings=Settings(anonymized_telemetry=False)
)

try:
    client.delete_collection(COLLECTION_NAME)
    print("🗑 Deleted:", COLLECTION_NAME)
except Exception:
    print("⚠️ Collection not found (skip)")

client.get_or_create_collection(name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"})
print("✅ Recreated:", COLLECTION_NAME)
