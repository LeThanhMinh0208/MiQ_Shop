import TradeInRequest from '../models/TradeInRequest.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import catchAsync from '../utils/catchAsync.js';

function sanitize(raw, max = 500) {
  if (typeof raw !== 'string') return '';
  return raw.replace(/<[^>]*>/g, '').trim().slice(0, max);
}

// POST /api/v1/trade-ins  (public)
export const createTradeIn = catchAsync(async (req, res) => {
  const { name, phone, productType, condition, description, images } = req.body;

  if (!name || !phone || !productType || !condition) {
    throw new ApiError(400, 'Vui lòng điền đầy đủ thông tin bắt buộc');
  }

  const VALID_CONDITIONS = ['nhu_moi', 'tot', 'trung_binh', 'cu'];
  if (!VALID_CONDITIONS.includes(condition)) {
    throw new ApiError(400, 'Tình trạng không hợp lệ');
  }

  // Validate images array
  const cleanImages = Array.isArray(images)
    ? images
        .filter((img) => img && typeof img.url === 'string' && img.url.startsWith('https://'))
        .slice(0, 3)
        .map((img) => ({ url: img.url, publicId: img.publicId || '' }))
    : [];

  const trade = await TradeInRequest.create({
    name:        sanitize(name, 100),
    phone:       sanitize(phone, 20),
    productType: sanitize(productType, 200),
    condition,
    description: sanitize(description || '', 1000),
    images:      cleanImages,
  });

  res.status(201).json(new ApiResponse(201, trade, 'Yêu cầu định giá đã được gửi, chúng tôi sẽ báo giá sớm'));
});

// GET /api/v1/trade-ins  (admin)
export const getTradeIns = catchAsync(async (_req, res) => {
  const trades = await TradeInRequest.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, trades));
});

// PATCH /api/v1/trade-ins/:id  (admin)
export const updateTradeIn = catchAsync(async (req, res) => {
  const { offeredPrice, status } = req.body;

  const VALID_STATUSES = ['cho_dinh_gia', 'da_dinh_gia', 'da_dong_y', 'tu_choi', 'hoan_thanh'];
  const updates = {};

  if (offeredPrice !== undefined) {
    const price = Number(offeredPrice);
    if (isNaN(price) || price < 0) throw new ApiError(400, 'Giá đề nghị không hợp lệ');
    updates.offeredPrice = price;
  }
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Trạng thái không hợp lệ');
    updates.status = status;
  }
  if (Object.keys(updates).length === 0) throw new ApiError(400, 'Không có trường nào để cập nhật');

  const trade = await TradeInRequest.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!trade) throw new ApiError(404, 'Không tìm thấy yêu cầu thu đổi');

  res.json(new ApiResponse(200, trade, 'Đã cập nhật yêu cầu thu đổi'));
});

// DELETE /api/v1/trade-ins/:id  (admin)
export const deleteTradeIn = catchAsync(async (req, res) => {
  const trade = await TradeInRequest.findByIdAndDelete(req.params.id);
  if (!trade) throw new ApiError(404, 'Không tìm thấy yêu cầu thu đổi');
  res.json(new ApiResponse(200, null, 'Đã xóa yêu cầu thu đổi'));
});
