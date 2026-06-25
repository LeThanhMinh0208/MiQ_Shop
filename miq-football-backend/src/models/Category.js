import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Tên danh mục là bắt buộc'], unique: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: 'Package' },
    displayOrder: { type: Number, default: 99 },
}, { timestamps: true });

categorySchema.pre('save', function() {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;