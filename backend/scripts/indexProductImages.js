import fs from "fs";
import os from "os";
import path from "path";
import { sql } from "../config/database.js";

const PY_SERVICE = process.env.IMAGE_SEARCH_SERVICE_URL || "http://localhost:8010";
const LIMIT = Number(process.env.IMAGE_INDEX_LIMIT || 50);
const CONCURRENCY = Number(process.env.IMAGE_INDEX_CONCURRENCY || 3);

async function downloadToTempFile(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed ${resp.status}: ${url}`);
  const buf = Buffer.from(await resp.arrayBuffer());

  const ext = url.toLowerCase().includes(".png") ? ".png" : ".jpg";
  const tmpPath = path.join(os.tmpdir(), `prod_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
  fs.writeFileSync(tmpPath, buf);
  return tmpPath;
}

async function upsertToPython({ id, name, imageUrl }) {
  const tmpFile = await downloadToTempFile(imageUrl);

  const form = new FormData();
  const blob = new Blob([fs.readFileSync(tmpFile)]);
  form.append("file", blob, "image.jpg");

  const qs = new URLSearchParams({
    product_id: String(id),      // ✅ ID thật (int)
    name: name || "",
    image_url: imageUrl || ""
  });

  const resp = await fetch(`${PY_SERVICE}/upsert-file?${qs.toString()}`, {
    method: "POST",
    body: form,
  });

  try { fs.unlinkSync(tmpFile); } catch {}

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Python upsert failed ${resp.status}: ${text}`);
  }
  return resp.json();
}

async function main() {
  console.log("🔗 Python:", PY_SERVICE);
  console.log("📌 LIMIT:", LIMIT, "CONCURRENCY:", CONCURRENCY);

  // ✅ Lấy sản phẩm có images[0]
  const products = await sql`
    SELECT id, name, images
    FROM product
    WHERE images IS NOT NULL
    ORDER BY id DESC
    LIMIT ${LIMIT}
  `;

  const tasks = products
    .map(p => {
      const imgs = Array.isArray(p.images) ? p.images : [];
      return { id: p.id, name: p.name, imageUrl: imgs[0] };
    })
    .filter(t => t.imageUrl);

  console.log("🖼️ Will index:", tasks.length);

  let i = 0, ok = 0, fail = 0;

  async function worker() {
    while (i < tasks.length) {
      const t = tasks[i++];
      try {
        const r = await upsertToPython(t);
        ok++;
        console.log(`✅ [${ok}/${tasks.length}] indexed id=${t.id} dim=${r.dim}`);
      } catch (e) {
        fail++;
        console.log(`❌ id=${t.id} ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log("🎉 Done ok=", ok, "fail=", fail);
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
