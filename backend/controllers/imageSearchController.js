import { sql } from "../config/database.js";

const PY_SERVICE = process.env.IMAGE_SEARCH_SERVICE_URL || "http://localhost:8010";

export async function imageSearch(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Missing image file (field name: file)" });
    }

    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Use jpg/png/webp" });
    }

    const topK = Number(req.query.top_k || 12);

    // ✅ Node 24: FormData + Blob là global
    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });

    // field name MUST be "file"
    form.append("file", blob, req.file.originalname || "query.png");

    const resp = await fetch(`${PY_SERVICE}/search?top_k=${topK}`, {
      method: "POST",
      body: form,
      // ✅ tuyệt đối KHÔNG set Content-Type thủ công
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ message: "Python service error", detail: text });
    }

    const result = await resp.json();
    const ids = result?.ids?.[0] || [];
    const distances = result?.distances?.[0] || [];

    if (ids.length === 0) return res.json({ results: [] });

    // DB: product.id là int (SERIAL), images JSONB
    const rows = await sql`
      SELECT id, name, images, price, category_id
      FROM product
      WHERE id = ANY(${ids})
    `;

    const map = new Map(rows.map(p => [String(p.id), p]));

    const results = ids.map((id, i) => {
      const p = map.get(String(id));
      if (!p) return null;

      const imgs = Array.isArray(p.images) ? p.images : [];
      return {
        product_id: Number(p.id),
        name: p.name,
        price: p.price,
        category_id: p.category_id,
        thumbnail: imgs[0] || null,
        distance: distances[i],
      };
    }).filter(Boolean);

    return res.json({ results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal error", error: e.message });
  }
}
