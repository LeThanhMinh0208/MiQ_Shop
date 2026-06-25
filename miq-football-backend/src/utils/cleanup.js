/**
 * cleanup.js — Reset sản phẩm về 40 placeholder, xóa ảnh Cloudinary/products
 * Chạy: node --experimental-vm-modules src/utils/cleanup.js
 * hoặc:  node -e "import('./src/utils/cleanup.js')"
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Category from '../models/Category.js';
import Product   from '../models/Product.js';
import Order     from '../models/Order.js';
import PrintOrder from '../models/PrintOrder.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Placeholder image ───────────────────────────────────────────────────────
const ph = (text, color = '10B981') =>
    `https://placehold.co/800x800/${color}/ffffff/png?text=${encodeURIComponent(text)}`;

// ─── 40 sản phẩm — 10 mỗi danh mục ─────────────────────────────────────────
const PRODUCTS = {
    'Giày Đá Bóng': {
        slug:  'boots',
        color: '10B981',
        sizes: ['39', '40', '41', '42', '43', '44'],
        names: [
            'Predator Elite FG',   'Mercurial Vapor 15',  'Phantom GX Elite',
            'Future Ultimate',     'Copa Pure II Elite',  'X Speedportal Elite',
            'Tiempo Legend 10',    'Morelia Neo IV',      'Superfly 9 Elite',
            'Nemeziz Tango',
        ],
        brands: ['Adidas','Nike','Nike','Puma','Adidas','Adidas','Nike','Mizuno','Nike','Adidas'],
        tags: [['fg','firm-ground'],['fg'],['fg','elite'],['fg'],['fg'],['fg'],['fg'],['fg'],['fg'],['turf']],
    },
    'Áo Đấu CLB': {
        slug:  'kits',
        color: '1E3A5F',
        sizes: ['S','M','L','XL','XXL'],
        names: [
            'Real Madrid Home 2024',     'Barcelona Away 2024',
            'Manchester United Home',    'Liverpool Home Kit',
            'PSG Third Kit 2024',        'Bayern Munich Home',
            'Juventus Away 2024',        'Arsenal Home Kit',
            'Chelsea Away 2024',         'Man City Home 2024',
        ],
        brands: ['Adidas','Nike','Adidas','Nike','Nike','Adidas','Adidas','Adidas','Nike','Puma'],
        tags: [['home','jersey'],['away','jersey'],['home','jersey'],['home','jersey'],['third','jersey'],
               ['home','jersey'],['away','jersey'],['home','jersey'],['away','jersey'],['home','jersey']],
    },
    'Trang Phục Thể Thao': {
        slug:  'apparel',
        color: '374151',
        sizes: ['S','M','L','XL'],
        names: [
            'Training Jersey Pro',   'Performance Hoodie',   'Track Pants Elite',
            'Compression Shirt',     'Windbreaker Jacket',   'Training Shorts Pro',
            'Long Sleeve Training',  'Zip Track Top',        'Recovery Tights',
            'Warm-Up Suit',
        ],
        brands: ['Nike','Adidas','Nike','Under Armour','Adidas','Nike','Puma','Adidas','Nike','Adidas'],
        tags: [['training'],['casual'],['training'],['compression'],['windbreaker'],
               ['shorts'],['training'],['training'],['recovery'],['warm-up']],
    },
    'Phụ Kiện': {
        slug:  'accessories',
        color: '059669',
        sizes: ['One Size'],
        names: [
            'Premium Match Ball',   'Goalkeeper Gloves Pro', 'Shin Guards Elite',
            'Sport Socks 3-Pack',   'Captain Armband Set',   'Training Cones 20-Pack',
            'Ball Pump Pro',        'Sport Backpack 30L',    'Water Bottle 750ml',
            'Headband & Wristband',
        ],
        brands: ['Adidas','Nike','Nike','Adidas','Nike','Puma','Adidas','Nike','Adidas','Nike'],
        tags: [['ball'],['goalkeeper'],['protection'],['socks'],['captain'],
               ['training'],['equipment'],['bag'],['hydration'],['accessories']],
    },
};

// ─── Xóa Cloudinary products folder ─────────────────────────────────────────
const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
};

async function deleteCloudinaryProducts() {
    console.log('\n☁️  Xóa ảnh Cloudinary (miq-football/products)...');
    let deleted = 0;

    // Lấy toàn bộ danh sách (max 500/lần, lặp qua next_cursor)
    const allPublicIds = [];
    let nextCursor;
    do {
        const params = { type: 'upload', prefix: 'miq-football/products', max_results: 500 };
        if (nextCursor) params.next_cursor = nextCursor;
        const result = await cloudinary.api.resources(params);
        allPublicIds.push(...(result.resources ?? []).map((r) => r.public_id));
        nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`   Tìm thấy ${allPublicIds.length} ảnh cần xóa`);

    // Xóa theo batch 100 (giới hạn Cloudinary)
    for (const batch of chunk(allPublicIds, 100)) {
        await cloudinary.api.delete_resources(batch);
        deleted += batch.length;
        console.log(`   Đã xóa ${deleted}/${allPublicIds.length}...`);
    }

    // Xóa folder sau khi đã rỗng
    try {
        await cloudinary.api.delete_folder('miq-football/products');
        console.log('   Đã xóa folder miq-football/products');
    } catch {
        // Folder không tồn tại hoặc đã rỗng — bỏ qua
    }

    console.log(`✅ Xóa Cloudinary xong — tổng ${deleted} ảnh`);
}

// ─── Reset & Seed 40 products ────────────────────────────────────────────────
async function resetProducts() {
    console.log('\n🗑️  Xóa sản phẩm, đơn hàng cũ...');
    await Product.deleteMany({});
    await Order.deleteMany({});
    await PrintOrder.deleteMany({});
    console.log('✅ Đã xóa products, orders, print-orders');

    // Lấy hoặc tạo 4 danh mục
    console.log('\n📂 Kiểm tra danh mục...');
    // Xóa và tạo lại categories sạch để tránh duplicate
    await Category.deleteMany({});

    const categoryDefs = [
        { name: 'Giày Đá Bóng',        description: 'Giày đá bóng chuyên nghiệp' },
        { name: 'Áo Đấu CLB',          description: 'Áo đấu chính hãng các CLB' },
        { name: 'Trang Phục Thể Thao', description: 'Trang phục tập luyện' },
        { name: 'Phụ Kiện',            description: 'Phụ kiện thể thao' },
    ];

    const cats = {};
    for (const def of categoryDefs) {
        const cat = await Category.create(def); // pre-save hook tự sinh slug
        console.log(`   Đã tạo: ${def.name} (slug: ${cat.slug})`);
        cats[def.name] = cat;
    }

    // Tạo 40 sản phẩm
    console.log('\n🏭 Tạo 40 sản phẩm placeholder...');
    const productsData = [];
    let idx = 1;

    for (const [catName, cfg] of Object.entries(PRODUCTS)) {
        const category = cats[catName];
        if (!category) {
            console.warn(`   ⚠️  Không tìm thấy danh mục: ${catName}`);
            continue;
        }

        for (let i = 0; i < 10; i++) {
            const name   = cfg.names[i];
            const brand  = cfg.brands[i];
            const price  = (Math.floor(Math.random() * 40 + 5) * 100_000); // 500k–4.5M
            const hasSale = idx % 3 !== 0;
            const variants = cfg.sizes.map((size) => ({
                size,
                stock: Math.floor(Math.random() * 50) + 10,
            }));

            productsData.push({
                name:        `${brand} ${name}`,
                description: `${brand} ${name} — sản phẩm chính hãng, chất lượng cao, phù hợp cho sân cỏ chuyên nghiệp lẫn nghiệp dư.`,
                brand,
                category:    category._id,
                price,
                salePrice:   hasSale ? Math.round(price * 0.82 / 1000) * 1000 : null,
                images:      [{
                    url:      ph(`${brand}\n${name.split(' ').slice(0,2).join(' ')}`, cfg.color),
                    publicId: `placeholder_${idx}`,
                    alt:      name,
                }],
                variants,
                tags:        [...cfg.tags[i], brand.toLowerCase().replace(' ', '-')],
                sport:       'football',
                features:    ['lightweight', 'breathable', 'durable'],
                ratings: {
                    average: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                    count:   Math.floor(Math.random() * 80) + 5,
                },
                isFeatured: idx % 8 === 0,
                isActive:   true,
            });
            idx++;
        }
    }

    // Dùng create() thay vì insertMany() để trigger pre-save hook sinh slug
    const created = await Product.create(productsData);
    console.log(`✅ Đã tạo ${created.length} sản phẩm`);

    const bycat = {};
    for (const p of created) {
        const cat = Object.values(cats).find((c) => c._id.toString() === p.category.toString());
        bycat[cat?.name] = (bycat[cat?.name] || 0) + 1;
    }
    for (const [name, count] of Object.entries(bycat)) {
        console.log(`   ${name}: ${count} sản phẩm`);
    }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công');

        await deleteCloudinaryProducts();
        await resetProducts();

        console.log('\n🎉 XONG! Database đã được thu hẹp về 40 sản phẩm.');
        console.log('   Hãy vào Admin → Sản phẩm để thêm ảnh thật.');
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();
