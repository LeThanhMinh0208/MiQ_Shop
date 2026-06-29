import QuoteRequest from '../models/QuoteRequest.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import catchAsync from '../utils/catchAsync.js';

function sanitize(raw) {
  if (typeof raw !== 'string') return '';
  return raw.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

export const createQuote = catchAsync(async (req, res) => {
  const { teamName, name, phone, email, requestType, quantity, note } = req.body;

  if (!name || !phone || !requestType) {
    throw new ApiError(400, 'Vui lòng điền đầy đủ thông tin bắt buộc');
  }

  const quote = await QuoteRequest.create({
    teamName:    sanitize(teamName || ''),
    name:        sanitize(name),
    phone:       sanitize(phone),
    email:       sanitize(email || ''),
    requestType,
    quantity:    Number(quantity) || 1,
    note:        sanitize(note || ''),
  });

  res.status(201).json(new ApiResponse(201, quote, 'Yêu cầu báo giá đã được gửi thành công'));
});

export const getQuotes = catchAsync(async (_req, res) => {
  const quotes = await QuoteRequest.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, quotes));
});

export const updateQuoteStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const allowed = ['cho_xu_ly', 'da_lien_he', 'da_bao_gia', 'huy'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Trạng thái không hợp lệ');

  const quote = await QuoteRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );
  if (!quote) throw new ApiError(404, 'Không tìm thấy yêu cầu báo giá');

  res.json(new ApiResponse(200, quote, 'Đã cập nhật trạng thái'));
});

export const deleteQuote = catchAsync(async (req, res) => {
  const quote = await QuoteRequest.findByIdAndDelete(req.params.id);
  if (!quote) throw new ApiError(404, 'Không tìm thấy yêu cầu báo giá');
  res.json(new ApiResponse(200, null, 'Đã xóa yêu cầu báo giá'));
});
