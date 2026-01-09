import { sql } from "../config/database.js";

const demo = [
  {
    name: "Basic White T-Shirt",
    price: 99000,
    category_id: null,
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tshirtwhite.jpg/640px-Tshirtwhite.jpg"],
  },
  {
    name: "Red Dress",
    price: 299000,
    category_id: null,
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Red_dress.jpg/640px-Red_dress.jpg"],
  },
  {
    name: "Blue Jeans",
    price: 399000,
    category_id: null,
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Jeans_for_men.jpg/640px-Jeans_for_men.jpg"],
  },
  {
    name: "Black Hoodie",
    price: 259000,
    category_id: null,
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Hoodie-black.jpg/640px-Hoodie-black.jpg"],
  },
  {
    name: "Running Shoes",
    price: 499000,
    category_id: null,
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Running_shoes_asics.jpg/640px-Running_shoes_asics.jpg"],
  },
];

async function ensureCategory() {
  // nếu bạn có bảng category và cần FK, tạo 1 category mặc định
  // Nếu schema category_id bắt buộc, bỏ comment phần này và dùng category_id = createdId
  try {
    const rows = await sql`SELECT id FROM category ORDER BY id ASC LIMIT 1`;
    if (rows.length) return rows[0].id;
    const created = await sql`
      INSERT INTO category (name)
      VALUES ('Demo Category')
      RETURNING id
    `;
    return created[0].id;
  } catch {
    return null; // nếu không có bảng category hoặc category_id không bắt buộc
  }
}

async function main() {
  const catId = await ensureCategory();

  let ok = 0;
  for (const p of demo) {
    const category_id = catId ?? p.category_id;

    // ⚠️ Nếu bảng product của bạn có cột bắt buộc khác (seller_id, stock,...)
    // thì bạn phải bổ sung tại đây theo schema thực tế.
    await sql`
      INSERT INTO product (name, price, images, category_id)
      VALUES (${p.name}, ${p.price}, ${sql.json(p.images)}, ${category_id})
    `;
    ok++;
  }

  console.log("✅ Seeded products:", ok);
}

main().catch(console.error);
