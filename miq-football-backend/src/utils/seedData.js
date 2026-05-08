import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// === DỮ LIỆU MẪU ===

const categoriesData = [
    { name: 'Football Boots', description: 'Giày đá bóng chuyên nghiệp' },
    { name: 'Club Kits', description: 'Áo đấu chính hãng các CLB' },
    { name: 'Sports Apparel', description: 'Trang phục tập luyện' },
    { name: 'Accessories', description: 'Phụ kiện thể thao' },
];

const brands = ['Adidas', 'Nike', 'Puma', 'Mizuno', 'Under Armour', 'New Balance'];

// Tên sản phẩm mẫu cho từng category
const productNames = {
    'Football Boots': [
        'Predator Elite F50', 'Mercurial Vapor 15', 'Phantom GX Elite', 'Future Ultimate',
        'Morelia Neo IV', 'Copa Pure', 'X Speedportal', 'Tiempo Legend 10',
        'Rapida Pro', 'Velocita 7', 'Magista Obra', 'Hypervenom Phantom',
    ],
    'Club Kits': [
        'Real Madrid Home Kit', 'Barcelona Away Kit', 'Manchester United Home',
        'Liverpool Home Kit', 'PSG Third Kit', 'Bayern Munich Home',
        'Juventus Away', 'Arsenal Home Kit', 'Chelsea Away Kit', 'Man City Home',
    ],
    'Sports Apparel': [
        'Training Jersey Pro', 'Performance Hoodie', 'Track Pants Elite',
        'Compression Shirt', 'Windbreaker Jacket', 'Training Shorts',
        'Long Sleeve Tee', 'Zip-up Track Top',
    ],
    'Accessories': [
        'Premium Football', 'Goalkeeper Gloves', 'Shin Guards Pro', 'Sport Socks',
        'Captain Armband', 'Training Cones Set', 'Ball Pump', 'Sports Backpack',
        'Water Bottle', 'Headband Set',
    ],
};

const tagsByCategory = {
    'Football Boots': [
        ['firm-ground', 'fg', 'pro'],
        ['turf', 'tf'],
        ['indoor', 'ic'],
        ['ag', 'artificial-grass']
    ],
    'Club Kits': [
        ['home', 'jersey'],
        ['away', 'jersey'],
        ['third', 'jersey'],
        ['training']
    ],
    'Sports Apparel': [
        ['training'],
        ['casual'],
        ['performance'],
        ['recovery']
    ],
    'Accessories': [
        ['ball'],
        ['protection'],
        ['equipment'],
        ['training-gear']
    ],
};

const sizesByCategory = {
    'Football Boots': ['39', '40', '41', '42', '43', '44'],
    'Club Kits': ['S', 'M', 'L', 'XL', 'XXL'],
    'Sports Apparel': ['S', 'M', 'L', 'XL'],
    'Accessories': ['One Size'],
};

// Placeholder image SVG cho mỗi category
const placeholderImage = (text, color = '10B981') =>
    `https://placehold.co/600x600/${color}/ffffff/png?text=${encodeURIComponent(text)}`;

// === HÀM TẠO RANDOM ===
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = () => Math.floor(Math.random() * 5000 + 1000) * 1000; // 1tr - 6tr VND

// === MAIN SEED FUNCTION ===
const seedDatabase = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Xóa data cũ
        console.log('🗑️  Xóa data cũ...');
        await Category.deleteMany({});
        await Product.deleteMany({});

        // 2. Tạo Categories
        console.log('📂 Tạo Categories...');
        const slugify = (await
            import ('slugify')).default;
        const categoriesWithSlug = categoriesData.map((c) => ({
            ...c,
            slug: slugify(c.name, { lower: true, strict: true }),
        }));
        const categories = await Category.insertMany(categoriesWithSlug);
        console.log(`✅ Đã tạo ${categories.length} categories`);

        // 3. Tạo Admin user (nếu chưa có)
        const existingAdmin = await User.findOne({ email: 'admin@miq.com' });
        if (!existingAdmin) {
            await User.create({
                name: 'MiQ Admin',
                email: 'admin@miq.com',
                password: 'admin123',
                role: 'admin',
            });
            console.log('👤 Đã tạo Admin: admin@miq.com / admin123');
        }

        // 4. Tạo 100 sản phẩm
        console.log('👟 Tạo 100 sản phẩm...');
        const products = [];

        for (let i = 0; i < 100; i++) {
            const category = random(categories);
            const categoryName = category.name;
            const baseName = random(productNames[categoryName]);
            const brand = random(brands);
            const price = randomPrice();
            const hasSale = Math.random() > 0.6; // 40% có sale
            const sizes = sizesByCategory[categoryName];

            // Tạo variants với stock random
            const variants = sizes.map((size) => ({
                size,
                stock: Math.floor(Math.random() * 50) + 5,
            }));

            // Tags ngẫu nhiên cho category
            const tags = [...random(tagsByCategory[categoryName]), brand.toLowerCase()];

            // Color theme cho ảnh placeholder dựa trên category
            const colorMap = {
                'Football Boots': '10B981',
                'Club Kits': '1F2937',
                'Sports Apparel': '6B7280',
                'Accessories': '059669',
            };

            const product = {
                name: `${brand} ${baseName} ${i + 1}`,
                description: `${brand} ${baseName} - sản phẩm chính hãng, công nghệ mới nhất, thiết kế hiện đại tối ưu hiệu suất sân cỏ. Phù hợp cho các vận động viên chuyên nghiệp và người chơi nghiệp dư.`,
                brand,
                category: category._id,
                price,
                salePrice: hasSale ? Math.floor(price * 0.8) : null,
                images: [{
                    url: placeholderImage(`${brand} ${baseName.substring(0, 15)}`, colorMap[categoryName]),
                    publicId: `seed_${i}`,
                    alt: baseName,
                }, ],
                variants,
                tags,
                sport: 'football',
                features: ['lightweight', 'breathable', 'durable'],
                ratings: {
                    average: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
                    count: Math.floor(Math.random() * 200) + 10,
                },
                isFeatured: Math.random() > 0.85, // 15% featured
                isActive: true,
            };

            products.push(product);
        }

        await Product.create(products);
        console.log(`✅ Đã tạo ${products.length} sản phẩm`);

        console.log('\n🎉 SEED HOÀN TẤT!');
        console.log('===================================');
        console.log(`📂 Categories: ${categories.length}`);
        console.log(`👟 Products: ${products.length}`);
        console.log(`👤 Admin login: admin@miq.com / admin123`);
        console.log('===================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed thất bại:', error);
        process.exit(1);
    }
};

seedDatabase();