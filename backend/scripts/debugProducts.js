import { sql } from "../config/database.js";

async function main() {
  const total = await sql`SELECT COUNT(*)::int AS c FROM product`;
  const withImages = await sql`
    SELECT COUNT(*)::int AS c
    FROM product
    WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
  `;

  const sample = await sql`
    SELECT id, name, images
    FROM product
    WHERE images IS NOT NULL
    ORDER BY id DESC
    LIMIT 5
  `;

  console.log("TOTAL products:", total[0].c);
  console.log("Products with images length>0:", withImages[0].c);
  console.log("SAMPLE:");
  console.dir(sample, { depth: 5 });
}

main().catch(console.error);
