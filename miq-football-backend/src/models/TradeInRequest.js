import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema({
  url:      { type: String, required: true },
  publicId: { type: String, default: '' },
}, { _id: false });

const tradeInSchema = new Schema({
  name:        { type: String, required: [true, 'Tên người dùng là bắt buộc'], trim: true },
  phone:       { type: String, required: [true, 'Số điện thoại là bắt buộc'], trim: true },
  productType: { type: String, required: [true, 'Loại sản phẩm là bắt buộc'], trim: true },
  condition:   {
    type: String,
    enum: ['nhu_moi', 'tot', 'trung_binh', 'cu'],
    required: [true, 'Tình trạng là bắt buộc'],
  },
  description:  { type: String, default: '', trim: true },
  images:       [imageSchema],
  offeredPrice: { type: Number, default: null },
  status:       {
    type: String,
    enum: ['cho_dinh_gia', 'da_dinh_gia', 'da_dong_y', 'tu_choi', 'hoan_thanh'],
    default: 'cho_dinh_gia',
  },
}, { timestamps: true });

export default mongoose.model('TradeInRequest', tradeInSchema);
