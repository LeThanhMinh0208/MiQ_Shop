import mongoose from 'mongoose';
import slugify from 'slugify';

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Tên sản phẩm là bắt buộc'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Mô tả sản phẩm là bắt buộc'] },
    brand: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: [true, 'Giá sản phẩm là bắt buộc'], min: 0 },
    salePrice: { type: Number, default: null },
    images: [{ url: { type: String, required: true }, publicId: String, alt: String }],
    variants: [{ size: { type: String, required: true }, stock: { type: Number, required: true, min: 0, default: 0 } }],
    tags: [String],
    sport: { type: String, default: 'football' },
    features: [String],
    ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });

productSchema.virtual('finalPrice').get(function() {
    return this.salePrice !== null ? this.salePrice : this.price;
});

productSchema.virtual('totalStock').get(function() {
    return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

productSchema.pre('save', function() {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

productSchema.methods.updateRatings = function() {
    if (this.reviews.length === 0) {
        this.ratings = { average: 0, count: 0 };
        return;
    }
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.ratings.average = parseFloat((total / this.reviews.length).toFixed(1));
    this.ratings.count = this.reviews.length;
};

const Product = mongoose.model('Product', productSchema);
export default Product;