/**
 * One-off script: upload 10 Unsplash images to Cloudinary (folder: collections),
 * then distribute them across existing collections' slides[] and modelPhotos[].
 *
 * Run from miq-football-backend/:
 *   node --env-file=.env scripts/seed-collection-images.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import '../src/config/cloudinary.js';
import connectDB from '../src/config/db.js';
import Collection from '../src/models/Collection.js';

// ── 10 source images ─────────────────────────────────────────────────────────
const SOURCES = [
  'https://images.unsplash.com/photo-1684355414454-ed132f6c41cd?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1671016233693-53162078ca1c?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1629977007371-0ba395424741?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1430232324554-8f4aebd06683?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1569531955323-33c6b2dca44b?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508100134119-f93388e60d95?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504016798967-59a258e9386d?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571754472834-677ab0a62ba7?w=1200&q=80&auto=format&fit=crop',
];

// ── Distribution plan: which images go to which collection + type ─────────────
// Indices reference the SOURCES array (0-based after upload)
// slides: hero slideshow images  |  modelPhotos: editorial/campaign images
const DISTRIBUTION = [
  { slug: 'nike',        type: 'slide',      idx: 0, caption: 'Nike — Phantom GX2 Elite 2025' },
  { slug: 'nike',        type: 'slide',      idx: 3, caption: 'Nike — Mercurial Vapor XV' },
  { slug: 'nike',        type: 'modelPhoto', idx: 6, title: 'Nike Strike Series', desc: 'Tốc độ & kiểm soát tuyệt đối' },
  { slug: 'nike',        type: 'modelPhoto', idx: 9, title: 'Nike Pro Kit 2025', desc: 'Trang bị như nhà nghề' },

  { slug: 'adidas',      type: 'slide',      idx: 1, caption: 'Adidas — Predator Elite 2025' },
  { slug: 'adidas',      type: 'slide',      idx: 4, caption: 'Adidas — X Crazyfast 2025' },
  { slug: 'adidas',      type: 'modelPhoto', idx: 7, title: 'Adidas Tiro Training', desc: 'Đồng phục tập luyện chuyên nghiệp' },

  { slug: 'puma',        type: 'slide',      idx: 2, caption: 'Puma — Future Ultimate 2025' },
  { slug: 'puma',        type: 'modelPhoto', idx: 5, title: 'Puma Ultra Rush', desc: 'Nhẹ không tưởng — Nhanh vượt trội' },

  { slug: 'new-balance', type: 'slide',      idx: 8, caption: 'New Balance — Furon V8 Pro' },
];

async function main() {
  await connectDB();

  // ── Step 1: Upload all 10 images to Cloudinary ───────────────────────────
  console.log('\nUploading 10 images to Cloudinary (folder: collections)...');
  const uploaded = [];

  for (let i = 0; i < SOURCES.length; i++) {
    const url = SOURCES[i];
    process.stdout.write(`  [${i + 1}/10] ${url.substring(34, 70)}... `);
    const res = await cloudinary.uploader.upload(url, {
      folder: 'collections',
      resource_type: 'image',
    });
    uploaded.push({ secure_url: res.secure_url, public_id: res.public_id });
    console.log(`✓  ${res.secure_url.substring(0, 80)}`);
  }

  console.log(`\n✓ ${uploaded.length} Cloudinary uploads complete.\n`);

  // ── Step 2: Distribute to collections ───────────────────────────────────
  const stats = {};

  for (const entry of DISTRIBUTION) {
    const img = uploaded[entry.idx];

    if (entry.type === 'slide') {
      await Collection.updateOne(
        { slug: entry.slug },
        { $push: { slides: { url: img.secure_url, publicId: img.public_id, caption: entry.caption } } },
      );
      stats[entry.slug] = stats[entry.slug] || { slides: 0, modelPhotos: 0 };
      stats[entry.slug].slides++;
      console.log(`  + slide → ${entry.slug}: "${entry.caption}"`);
    } else {
      await Collection.updateOne(
        { slug: entry.slug },
        { $push: { modelPhotos: { url: img.secure_url, publicId: img.public_id, title: entry.title, desc: entry.desc } } },
      );
      stats[entry.slug] = stats[entry.slug] || { slides: 0, modelPhotos: 0 };
      stats[entry.slug].modelPhotos++;
      console.log(`  + modelPhoto → ${entry.slug}: "${entry.title}"`);
    }
  }

  // ── Step 3: Summary ──────────────────────────────────────────────────────
  console.log('\n── Distribution summary ──');
  for (const [slug, counts] of Object.entries(stats)) {
    console.log(`  ${slug}: +${counts.slides} slides, +${counts.modelPhotos} modelPhotos`);
  }

  // ── Step 4: Verify — print final state of collections touched ────────────
  console.log('\n── Final DB state ──');
  const slugs = [...new Set(DISTRIBUTION.map(d => d.slug))];
  for (const slug of slugs) {
    const col = await Collection.findOne({ slug });
    if (!col) {
      console.log(`  ${slug}: NOT FOUND in DB (will use fallback on frontend)`);
      continue;
    }
    console.log(`\n  Collection: ${col.name} (${slug})`);
    console.log(`    slides (${col.slides.length}):`);
    for (const s of col.slides) {
      const isCloud = s.url.includes('res.cloudinary.com');
      console.log(`      ${isCloud ? '✓' : '○'} ${s.url.substring(0, 80)}`);
    }
    console.log(`    modelPhotos (${col.modelPhotos.length}):`);
    for (const m of col.modelPhotos) {
      const isCloud = m.url.includes('res.cloudinary.com');
      console.log(`      ${isCloud ? '✓' : '○'} ${m.url.substring(0, 80)}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
