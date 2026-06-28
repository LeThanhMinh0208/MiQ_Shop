import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const slideSchema = new Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, default: '' },
  caption:   { type: String, default: '' },
}, { _id: true });

const modelPhotoSchema = new Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, default: '' },
  title:     { type: String, default: '' },
  desc:      { type: String, default: '' },
}, { _id: true });

const collectionSchema = new Schema({
  name:        { type: String, required: [true, 'Tên bộ sưu tập là bắt buộc'], trim: true },
  slug:        { type: String, unique: true, index: true },
  brand:       { type: String, required: [true, 'Tên thương hiệu là bắt buộc'], trim: true },
  tagline:     { type: String, default: '' },
  description: { type: String, default: '' },
  accentColor: { type: String, default: '#10B981' },
  slides:      [slideSchema],
  modelPhotos: [modelPhotoSchema],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// Slug auto-generated from brand (e.g. "New Balance" → "new-balance")
collectionSchema.pre('save', function () {
  if (!this.slug || this.isModified('brand')) {
    this.slug = slugify(this.brand, { lower: true, strict: true });
  }
});

export default mongoose.model('Collection', collectionSchema);
