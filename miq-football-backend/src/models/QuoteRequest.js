import mongoose from 'mongoose';

const { Schema } = mongoose;

const quoteRequestSchema = new Schema({
  teamName:    { type: String, default: '', trim: true },
  name:        { type: String, required: [true, 'Người liên hệ là bắt buộc'], trim: true },
  phone:       { type: String, required: [true, 'Số điện thoại là bắt buộc'], trim: true },
  email:       { type: String, default: '', trim: true, lowercase: true },
  requestType: {
    type: String,
    enum: ['in_ao', 'combo_doi', 'mua_si', 'khac'],
    required: [true, 'Loại yêu cầu là bắt buộc'],
  },
  quantity: { type: Number, min: 1, default: 1 },
  note:     { type: String, default: '', trim: true },
  status:   {
    type: String,
    enum: ['cho_xu_ly', 'da_lien_he', 'da_bao_gia', 'huy'],
    default: 'cho_xu_ly',
  },
}, { timestamps: true });

export default mongoose.model('QuoteRequest', quoteRequestSchema);
