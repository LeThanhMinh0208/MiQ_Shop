import slugify from 'slugify';
import Collection from '../models/Collection.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';

// GET /api/v1/collections
export const getCollections = catchAsync(async (req, res) => {
  const filter = req.query.showAll === 'true' ? {} : { isActive: true };
  const collections = await Collection.find(filter).sort({ createdAt: -1 }).lean();
  res.json(new ApiResponse(200, collections, 'OK'));
});

// GET /api/v1/collections/:slug
export const getCollectionBySlug = catchAsync(async (req, res) => {
  const collection = await Collection.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!collection) throw new ApiError(404, 'Không tìm thấy bộ sưu tập');
  res.json(new ApiResponse(200, collection, 'OK'));
});

// POST /api/v1/collections  (admin)
export const createCollection = catchAsync(async (req, res) => {
  const { name, brand, tagline, description, accentColor } = req.body;
  const collection = await Collection.create({ name, brand, tagline, description, accentColor });
  res.status(201).json(new ApiResponse(201, collection, 'Tạo bộ sưu tập thành công'));
});

// PUT /api/v1/collections/:id  (admin) — updates basic fields only
export const updateCollection = catchAsync(async (req, res) => {
  const { name, brand, tagline, description, accentColor, isActive } = req.body;
  const updates = {};
  if (name      !== undefined) updates.name      = name;
  if (brand     !== undefined) { updates.brand = brand; updates.slug = slugify(brand, { lower: true, strict: true }); }
  if (tagline   !== undefined) updates.tagline   = tagline;
  if (description !== undefined) updates.description = description;
  if (accentColor !== undefined) updates.accentColor = accentColor;
  if (isActive  !== undefined) updates.isActive  = isActive;

  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!collection) throw new ApiError(404, 'Không tìm thấy bộ sưu tập');
  res.json(new ApiResponse(200, collection, 'Cập nhật thành công'));
});

// DELETE /api/v1/collections/:id  (admin)
export const deleteCollection = catchAsync(async (req, res) => {
  const collection = await Collection.findByIdAndDelete(req.params.id);
  if (!collection) throw new ApiError(404, 'Không tìm thấy bộ sưu tập');
  res.json(new ApiResponse(200, null, 'Đã xóa bộ sưu tập'));
});

// POST /api/v1/collections/:id/slides  (admin)
export const addSlide = catchAsync(async (req, res) => {
  const { url, publicId, caption } = req.body;
  if (!url) throw new ApiError(400, 'URL ảnh là bắt buộc');
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { $push: { slides: { url, publicId: publicId || '', caption: caption || '' } } },
    { new: true },
  );
  if (!collection) throw new ApiError(404, 'Không tìm thấy bộ sưu tập');
  res.json(new ApiResponse(200, collection, 'Đã thêm slide'));
});

// DELETE /api/v1/collections/:id/slides/:slideId  (admin)
export const removeSlide = catchAsync(async (req, res) => {
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { $pull: { slides: { _id: req.params.slideId } } },
    { new: true },
  );
  if (!collection) throw new ApiError(404, 'Không tìm thấy bộ sưu tập');
  res.json(new ApiResponse(200, collection, 'Đã xóa slide'));
});

// POST /api/v1/collections/:id/model-photos  (admin)
export const addModelPhoto = catchAsync(async (req, res) => {
  const { url, publicId, title, desc } = req.body;
  if (!url) throw new ApiError(400, 'URL ảnh là bắt buộc');
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { $push: { modelPhotos: { url, publicId: publicId || '', title: title || '', desc: desc || '' } } },
    { new: true },
  );
  if (!collection) throw new ApiError(404, 'Không tìm thấy bộ sưu tập');
  res.json(new ApiResponse(200, collection, 'Đã thêm ảnh'));
});

// DELETE /api/v1/collections/:id/model-photos/:photoId  (admin)
export const removeModelPhoto = catchAsync(async (req, res) => {
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { $pull: { modelPhotos: { _id: req.params.photoId } } },
    { new: true },
  );
  if (!collection) throw new ApiError(404, 'Không tìm thấy bộ sưu tập');
  res.json(new ApiResponse(200, collection, 'Đã xóa ảnh'));
});
