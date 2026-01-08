from chroma_client import get_chroma_collection

def main():
    col = get_chroma_collection()

    print("📦 Collection count (before):", col.count())

    # 1️⃣ Upsert vector giả lập
    col.upsert(
        ids=["demo_product_1"],
        embeddings=[[0.1, 0.12, 0.05, 0.9, 0.02, 0.03, 0.11, 0.7]],
        metadatas=[{
            "product_id": "demo_product_1",
            "name": "Demo Dress",
            "category": "Apparel",
            "price": 199000,
            "image_url": "https://example.com/demo.jpg"
        }],
        documents=["demo document"]
    )

    print("✅ Upsert OK")
    print("📦 Collection count (after):", col.count())

    # 2️⃣ Query 
    result = col.query(
    query_embeddings=[[0.09, 0.11, 0.05, 0.88, 0.02, 0.04, 0.1, 0.69]],
    n_results=3,
    include=["distances", "metadatas"]  # bỏ "ids"
)

  

    print("\n🔍 Query result:")
    print(result)

if __name__ == "__main__":
    main()
