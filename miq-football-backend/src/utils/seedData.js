import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// === DỮ LIỆU MẪU ===

const categoriesData = [
    { name: 'Giày Đá Bóng',        slug: 'boots',       description: 'Giày đá bóng chuyên nghiệp' },
    { name: 'Áo Đấu CLB',          slug: 'kits',        description: 'Áo đấu chính hãng các CLB' },
    { name: 'Trang Phục Thể Thao', slug: 'apparel',     description: 'Trang phục tập luyện' },
    { name: 'Phụ Kiện',            slug: 'accessories', description: 'Phụ kiện thể thao' },
];

const brands = ['Adidas', 'Nike', 'Puma', 'Mizuno', 'Under Armour', 'New Balance'];

const productNames = {
    'Giày Đá Bóng': [
        'Predator Elite F50', 'Mercurial Vapor 15', 'Phantom GX Elite', 'Future Ultimate',
        'Morelia Neo IV', 'Copa Pure', 'X Speedportal', 'Tiempo Legend 10',
        'Rapida Pro', 'Velocita 7', 'Magista Obra', 'Hypervenom Phantom',
    ],
    'Áo Đấu CLB': [
        'Real Madrid Home Kit', 'Barcelona Away Kit', 'Manchester United Home',
        'Liverpool Home Kit', 'PSG Third Kit', 'Bayern Munich Home',
        'Juventus Away', 'Arsenal Home Kit', 'Chelsea Away Kit', 'Man City Home',
    ],
    'Trang Phục Thể Thao': [
        'Training Jersey Pro', 'Performance Hoodie', 'Track Pants Elite',
        'Compression Shirt', 'Windbreaker Jacket', 'Training Shorts',
        'Long Sleeve Tee', 'Zip-up Track Top',
    ],
    'Phụ Kiện': [
        'Premium Football', 'Goalkeeper Gloves', 'Shin Guards Pro', 'Sport Socks',
        'Captain Armband', 'Training Cones Set', 'Ball Pump', 'Sports Backpack',
        'Water Bottle', 'Headband Set',
    ],
};

const tagsByCategory = {
    'Giày Đá Bóng': [
        ['firm-ground', 'fg', 'pro'],
        ['turf', 'tf'],
        ['indoor', 'ic'],
        ['ag', 'artificial-grass'],
    ],
    'Áo Đấu CLB': [
        ['home', 'jersey'],
        ['away', 'jersey'],
        ['third', 'jersey'],
        ['training'],
    ],
    'Trang Phục Thể Thao': [
        ['training'],
        ['casual'],
        ['performance'],
        ['recovery'],
    ],
    'Phụ Kiện': [
        ['ball'],
        ['protection'],
        ['equipment'],
        ['training-gear'],
    ],
};

const sizesByCategory = {
    'Giày Đá Bóng':        ['39', '40', '41', '42', '43', '44'],
    'Áo Đấu CLB':          ['S', 'M', 'L', 'XL', 'XXL'],
    'Trang Phục Thể Thao': ['S', 'M', 'L', 'XL'],
    'Phụ Kiện':            ['One Size'],
};

const placeholderImage = (text, color = '10B981') =>
    `https://placehold.co/600x600/${color}/ffffff/png?text=${encodeURIComponent(text)}`;

// === HÀM RANDOM ===
const random  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = () => Math.floor(Math.random() * 5000 + 1000) * 1000;

// === MAIN SEED ===
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công');

        // 1. Xóa data cũ (không xóa User)
        console.log('🗑️  Xóa Category và Product cũ...');
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // 2. Tạo Categories
        console.log('📂 Tạo danh mục...');
        const slugify = (await import('slugify')).default;
        const categoriesWithSlug = categoriesData.map((c) => ({
            ...c,
            slug: c.slug || slugify(c.name, { lower: true, strict: true }),
        }));
        const categories = await Category.insertMany(categoriesWithSlug);
        console.log(`✅ Đã tạo ${categories.length} danh mục`);

        // 3. Tạo 50 sản phẩm — phân bổ cố định theo danh mục
        // Giày Đá Bóng: 18 | Áo Đấu CLB: 15 | Trang Phục: 10 | Phụ Kiện: 7
        console.log('👟 Tạo 50 sản phẩm...');
        const productsData = [];

        const colorMap = {
            'Giày Đá Bóng':        '10B981',
            'Áo Đấu CLB':          '1F2937',
            'Trang Phục Thể Thao': '6B7280',
            'Phụ Kiện':            '059669',
        };

        // Số lượng sản phẩm cố định cho mỗi danh mục (tổng = 50)
        const countPerCategory = {
            'Giày Đá Bóng':        18,
            'Áo Đấu CLB':          15,
            'Trang Phục Thể Thao': 10,
            'Phụ Kiện':             7,
        };

        let globalIndex = 1;
        for (const category of categories) {
            const categoryName = category.name;
            const count        = countPerCategory[categoryName] ?? 0;
            const sizes        = sizesByCategory[categoryName];
            const names        = productNames[categoryName];
            const color        = colorMap[categoryName];

            for (let i = 0; i < count; i++) {
                const baseName = names[i % names.length];
                const brand    = brands[i % brands.length];
                const price    = randomPrice();
                const hasSale  = globalIndex % 3 !== 0; // ~2/3 sản phẩm có giảm giá
                const variants = sizes.map((size) => ({
                    size,
                    stock: Math.floor(Math.random() * 50) + 5,
                }));
                const tags = [...random(tagsByCategory[categoryName]), brand.toLowerCase()];

                productsData.push({
                    name: `${brand} ${baseName} ${globalIndex}`,
                    description: `${brand} ${baseName} — sản phẩm chính hãng, công nghệ mới nhất, thiết kế hiện đại tối ưu hiệu suất sân cỏ.`,
                    brand,
                    category: category._id,
                    price,
                    salePrice: hasSale ? Math.floor(price * 0.8) : null,
                    images: [{
                        url:      placeholderImage(`${brand} ${baseName.substring(0, 15)}`, color),
                        publicId: `seed_${globalIndex}`,
                        alt:      baseName,
                    }],
                    variants,
                    tags,
                    sport:    'football',
                    features: ['lightweight', 'breathable', 'durable'],
                    ratings: {
                        average: parseFloat((Math.random() * 2 + 3).toFixed(1)),
                        count:   Math.floor(Math.random() * 200) + 10,
                    },
                    isFeatured: globalIndex % 7 === 0, // ~1/7 sản phẩm nổi bật
                    isActive:   true,
                });
                globalIndex++;
            }
        }

        const createdProducts = await Product.create(productsData);
        console.log(`✅ Đã tạo ${createdProducts.length} sản phẩm`);
        console.log(`   🥾 Giày Đá Bóng:        ${countPerCategory['Giày Đá Bóng']}`);
        console.log(`   👕 Áo Đấu CLB:          ${countPerCategory['Áo Đấu CLB']}`);
        console.log(`   🩳 Trang Phục Thể Thao: ${countPerCategory['Trang Phục Thể Thao']}`);
        console.log(`   🎽 Phụ Kiện:             ${countPerCategory['Phụ Kiện']}`);

        // 4. Tài khoản admin cũ (giữ lại)
        const existingOldAdmin = await User.findOne({ email: 'admin@miq.com' });
        if (!existingOldAdmin) {
            await User.create({
                name: 'MiQ Admin',
                email: 'admin@miq.com',
                password: 'admin123',
                role: 'admin',
            });
            console.log('👤 Giữ lại: admin@miq.com / admin123');
        }

        // 5. Tạo tài khoản test
        console.log('🔑 Tạo tài khoản test...');

        // Admin mới
        const adminEmail    = 'admin@miq.vn';
        let   adminUser     = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = await User.create({
                name:     'Admin MiQ',
                email:    adminEmail,
                password: 'Admin@123',
                role:     'admin',
            });
            console.log('👨‍💼 Tạo admin@miq.vn / Admin@123');
        }

        // User demo
        const userEmail = 'user@miq.vn';
        let   testUser  = await User.findOne({ email: userEmail });
        if (!testUser) {
            testUser = await User.create({
                name:     'Lê Thanh Minh',
                email:    userEmail,
                password: 'User@123',
                role:     'user',
                addresses: [{
                    label:     'Nhà',
                    fullName:  'Lê Thanh Minh',
                    phone:     '0378123395',
                    street:    '123 Nguyễn Văn Cừ',
                    ward:      'Phường 4',
                    district:  'Quận 5',
                    city:      'TP. Hồ Chí Minh',
                    isDefault: true,
                }],
                stats: {
                    totalSpent:  5000000,
                    orderCount:  3,
                    lastOrderAt: new Date(Date.now() - 7 * 86400000),
                },
            });
            console.log('👤 Tạo user@miq.vn / User@123');
        }

        // 6. Tạo 3 đơn hàng mẫu cho user@miq.vn
        console.log('📦 Tạo đơn hàng mẫu...');

        // Lấy sản phẩm từ các danh mục
        const bootCat    = categories.find((c) => c.slug === 'boots');
        const kitCat     = categories.find((c) => c.slug === 'kits');
        const apparelCat = categories.find((c) => c.slug === 'apparel');

        const boots   = createdProducts.filter((p) => p.category.toString() === bootCat._id.toString());
        const kits    = createdProducts.filter((p) => p.category.toString() === kitCat._id.toString());
        const apparel = createdProducts.filter((p) => p.category.toString() === apparelCat._id.toString());

        const p0 = boots[0],   p1 = kits[0],   p2 = boots[1];
        const p3 = apparel[0], p4 = boots[2];

        const shippingAddress = {
            fullName: 'Lê Thanh Minh',
            phone:    '0378123395',
            street:   '123 Nguyễn Văn Cừ',
            district: 'Quận 5',
            city:     'TP. Hồ Chí Minh',
        };

        // Đơn 1: delivered
        const item0Price = p0.price;
        const item1Price = p1.salePrice || p1.price;
        const order1Items = [
            { product: p0._id, name: p0.name, image: p0.images[0].url, price: item0Price, size: '42', quantity: 1 },
            { product: p1._id, name: p1.name, image: p1.images[0].url, price: item1Price, size: 'M',  quantity: 2 },
        ];
        const order1ItemsPrice = item0Price + item1Price * 2;

        // Đơn 2: shipping
        const item2Price = p2.price;
        const order2Items = [
            { product: p2._id, name: p2.name, image: p2.images[0].url, price: item2Price, size: '43', quantity: 1 },
        ];
        const order2ItemsPrice = item2Price;

        // Đơn 3: pending
        const item3Price = p3.salePrice || p3.price;
        const item4Price = p4.price;
        const order3Items = [
            { product: p3._id, name: p3.name, image: p3.images[0].url, price: item3Price, size: 'L',  quantity: 1 },
            { product: p4._id, name: p4.name, image: p4.images[0].url, price: item4Price, size: '41', quantity: 1 },
        ];
        const order3ItemsPrice = item3Price + item4Price;

        await Order.insertMany([
            {
                user: testUser._id,
                items: order1Items,
                shippingAddress,
                itemsPrice:   order1ItemsPrice,
                shippingPrice: 0,
                totalPrice:   order1ItemsPrice,
                payment: { method: 'cod', isPaid: true, paidAt: new Date(Date.now() - 14 * 86400000) },
                status: 'delivered',
                statusHistory: [
                    { status: 'pending',   note: 'Đơn hàng vừa được tạo',    updatedAt: new Date(Date.now() - 14 * 86400000) },
                    { status: 'confirmed', note: 'Đã xác nhận đơn hàng',     updatedAt: new Date(Date.now() - 13 * 86400000) },
                    { status: 'shipping',  note: 'Đang giao hàng đến bạn',   updatedAt: new Date(Date.now() - 12 * 86400000) },
                    { status: 'delivered', note: 'Giao hàng thành công',      updatedAt: new Date(Date.now() - 10 * 86400000) },
                ],
                notes: 'Giao giờ hành chính',
            },
            {
                user: testUser._id,
                items: order2Items,
                shippingAddress,
                itemsPrice:   order2ItemsPrice,
                shippingPrice: 30000,
                totalPrice:   order2ItemsPrice + 30000,
                payment: { method: 'stripe', isPaid: true, paidAt: new Date(Date.now() - 3 * 86400000) },
                status: 'shipping',
                statusHistory: [
                    { status: 'pending',   note: 'Đơn hàng vừa được tạo',  updatedAt: new Date(Date.now() - 3 * 86400000) },
                    { status: 'confirmed', note: 'Đã xác nhận đơn hàng',   updatedAt: new Date(Date.now() - 2 * 86400000) },
                    { status: 'shipping',  note: 'Đang giao hàng đến bạn', updatedAt: new Date(Date.now() - 1 * 86400000) },
                ],
            },
            {
                user: testUser._id,
                items: order3Items,
                shippingAddress,
                itemsPrice:   order3ItemsPrice,
                shippingPrice: 30000,
                totalPrice:   order3ItemsPrice + 30000,
                payment: { method: 'cod', isPaid: false },
                status: 'pending',
                statusHistory: [
                    { status: 'pending', note: 'Đơn hàng vừa được tạo', updatedAt: new Date() },
                ],
            },
        ]);
        console.log('✅ Đã tạo 3 đơn hàng mẫu');

        console.log('\n🎉 SEED HOÀN TẤT!');
        console.log('===================================');
        console.log(`📂 Danh mục: ${categories.length}`);
        console.log(`👟 Sản phẩm: ${createdProducts.length} (50 sản phẩm demo)`);
        console.log(`📦 Đơn hàng: 3`);
        console.log('');
        console.log('🔑 TÀI KHOẢN TEST');
        console.log('===================================');
        console.log('👨‍💼 ADMIN:');
        console.log('   Email: admin@miq.vn');
        console.log('   Pass:  Admin@123');
        console.log('');
        console.log('👤 USER:');
        console.log('   Email: user@miq.vn');
        console.log('   Pass:  User@123');
        console.log('===================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed thất bại:', error);
        process.exit(1);
    }
};

seedDatabase();
