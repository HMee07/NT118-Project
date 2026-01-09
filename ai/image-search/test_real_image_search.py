from chroma_client import get_collection
from embed_clip import embed_image_from_url

def main():
    col = get_collection()

    # 1) Ảnh test (bạn có thể thay bằng ảnh sản phẩm Cloudinary của bạn)
    img_url_1 = "https://nhatminhdecor.com/wp-content/uploads/2019/01/chup-anh-voi-mau-that-800x800.jpg"
    img_url_2 = "https://i.pinimg.com/236x/0f/a7/d1/0fa7d10665d6c4c5e0419aedb5f6848b--%C3%A1o-croptop-%C3%A1o-blu.jpg"

    # 2) Embed 2 ảnh và upsert như 2 "sản phẩm"
    emb1 = embed_image_from_url(img_url_1)
    emb2 = embed_image_from_url(img_url_2)

    col.upsert(
        ids=["p1", "p2"],
        embeddings=[emb1, emb2],
        metadatas=[
            {"product_id": "p1", "name": "Demo 1", "image_url": img_url_1},
            {"product_id": "p2", "name": "Demo 2", "image_url": img_url_2},
        ],
        documents=["demo1", "demo2"]
    )

    print("✅ Upsert OK. Count:", col.count())

    # 3) Query bằng ảnh 1 -> top-1 thường là p1
    res = col.query(
        query_embeddings=[emb1],
        n_results=2,
        include=["distances", "metadatas"]
    )

    print("🔍 Query result:", res)
    print("Top-1 id:", res["ids"][0][0])
    print("Top-1 distance:", res["distances"][0][0])
    print("Top-1 metadata:", res["metadatas"][0][0])

if __name__ == "__main__":
    main()
