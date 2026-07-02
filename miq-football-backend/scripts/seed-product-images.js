/**
 * One-off script: upload category source images to Cloudinary, then point every
 * seeded product at the matching Cloudinary URL.
 *
 * Run:  node --env-file=../.env scripts/seed-product-images.js
 * (from miq-football-backend root)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// ── Models (inline-import so we don't need the full app) ─────────────────────
import '../src/config/cloudinary.js';   // configures cloudinary singleton
import connectDB from '../src/config/db.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

// ── Source images per category type ─────────────────────────────────────────
const SOURCES = {
  boots: [
    'https://images.unsplash.com/photo-1684355414454-ed132f6c41cd?w=600&q=80&auto=format&fit=crop',
  ],
  jersey: [
    'https://images.unsplash.com/photo-1671016233693-53162078ca1c?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1629977007371-0ba395424741?w=600&q=80&auto=format&fit=crop',
  ],
  accessories: [
    // No clean accessory image yet — fall back to boot image per spec
    'https://images.unsplash.com/photo-1684355414454-ed132f6c41cd?w=600&q=80&auto=format&fit=crop',
  ],
};

// Category name → type mapping (Vietnamese names from seedData.js)
function getCategoryType(name = '') {
  const n = name.toLowerCase();
  if (n.includes('giày')) return 'boots';
  if (n.includes('áo') || n.includes('trang phục')) return 'jersey';
  if (n.includes('phụ kiện') || n.includes('accessor')) return 'accessories';
  return 'jersey'; // safe fallback
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await connectDB();

  // 1 ─ Upload each unique source URL to Cloudinary ONCE
  const allUrls = [...new Set([
    ...SOURCES.boots,
    ...SOURCES.jersey,
    ...SOURCES.accessories,
  ])];

  console.log(`\nUploading ${allUrls.length} unique source image(s) to Cloudinary...`);
  const urlToCloud = {};   // unsplash url → { secure_url, public_id }

  for (const url of allUrls) {
    process.stdout.write(`  Uploading ${url.substring(0, 70)}... `);
    const res = await cloudinary.uploader.upload(url, {
      folder: 'products',
      resource_type: 'image',
    });
    urlToCloud[url] = { secure_url: res.secure_url, public_id: res.public_id };
    console.log(`✓  ${res.secure_url}`);
  }

  const cloudUrls = {
    boots:       SOURCES.boots.map(u => urlToCloud[u]),
    jersey:      SOURCES.jersey.map(u => urlToCloud[u]),
    accessories: SOURCES.accessories.map(u => urlToCloud[u]),
  };

  console.log(`\nCloudinary upload count: ${allUrls.length}`);

  // 2 ─ Load all categories
  const categories = await Category.find({});
  const catTypeMap = {};   // categoryId → type
  for (const cat of categories) {
    catTypeMap[cat._id.toString()] = getCategoryType(cat.name);
  }

  // 3 ─ Load all products, assign images by category type
  const products = await Product.find({}).select('_id name category images');
  const counts = { boots: 0, jersey: 0, accessories: 0, unknown: 0 };

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const type = catTypeMap[p.category?.toString()] || 'jersey';

    // Rotate through available images for this category
    const pool = cloudUrls[type];
    const entry = pool[i % pool.length];

    await Product.updateOne(
      { _id: p._id },
      { $set: { images: [{ url: entry.secure_url, publicId: entry.public_id, alt: p.name }] } },
    );

    counts[type] = (counts[type] || 0) + 1;
  }

  // 4 ─ Summary
  console.log('\n── Products updated per category ──');
  console.log(`  Giày Đá Bóng (boots):        ${counts.boots}`);
  console.log(`  Áo Đấu / Trang Phục (jersey): ${counts.jersey}`);
  console.log(`  Phụ Kiện (accessories):       ${counts.accessories}`);
  console.log(`  Total:                         ${products.length}`);

  // 5 ─ Spot-check: 2-3 products per category
  console.log('\n── Sample products (2 per category) ──');
  for (const [type, label] of [['boots', 'Giày'], ['jersey', 'Áo/Trang Phục'], ['accessories', 'Phụ Kiện']]) {
    const catIds = Object.entries(catTypeMap)
      .filter(([, t]) => t === type)
      .map(([id]) => id);
    const samples = await Product.find({ category: { $in: catIds } })
      .select('name images')
      .limit(2);
    console.log(`\n  ${label}:`);
    for (const s of samples) {
      const imgUrl = s.images[0]?.url || '(none)';
      const isCloudinary = imgUrl.includes('res.cloudinary.com');
      console.log(`    ${s.name}`);
      console.log(`      ${imgUrl}`);
      console.log(`      ✓ Cloudinary URL: ${isCloudinary}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
