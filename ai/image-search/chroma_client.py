import chromadb
from chromadb.config import Settings
from config import CHROMA_DB_DIR, COLLECTION_NAME

def get_collection():
    client = chromadb.PersistentClient(
        path=CHROMA_DB_DIR,
        settings=Settings(anonymized_telemetry=False)
    )
    col = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}  # cosine similarity
    )
    return col
