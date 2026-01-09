from chroma_client import get_collection

col = get_collection()
print("COUNT =", col.count())
