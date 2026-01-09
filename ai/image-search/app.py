from fastapi import FastAPI, UploadFile, File, Query
from chroma_client import get_collection
from embed_clip import embed_image_from_bytes

app = FastAPI(title="Image Search (Local CLIP + Chroma)")
col = get_collection()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upsert")
async def upsert(
    product_id: str = Query(...),
    name: str = Query(...),
    image_url: str = Query(None)
):
    """
    Upsert 1 sản phẩm bằng ảnh upload.
    Dùng cho Phase B (index ảnh từ backend).
    """
    # nhận file
    # (để dùng multipart, ta nhận file ở endpoint riêng)
    return {"message": "Use /upsert-file to upload image file"}

@app.post("/upsert-file")
async def upsert_file(
    product_id: str = Query(...),
    name: str = Query(...),
    image_url: str = Query(None),
    file: UploadFile = File(...)
):
    b = await file.read()
    emb = embed_image_from_bytes(b)

    col.upsert(
        ids=[product_id],
        embeddings=[emb],
        metadatas=[{
            "product_id": product_id,
            "name": name,
            "image_url": image_url or ""
        }]
    )
    return {"ok": True, "product_id": product_id, "dim": len(emb), "count": col.count()}

@app.post("/search")
async def search(
    top_k: int = Query(10, ge=1, le=50),
    file: UploadFile = File(...)
):
    b = await file.read()
    emb = embed_image_from_bytes(b)

    res = col.query(
        query_embeddings=[emb],
        n_results=top_k,
        include=["distances", "metadatas"]
    )
    return res
