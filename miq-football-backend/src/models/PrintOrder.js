import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  playerName:   { type: String, required: true, trim: true },
  jerseyNumber: { type: String, required: true, trim: true },
  size:         { type: String, required: true, default: 'M' },
}, { _id: false });

const printOrderSchema = new mongoose.Schema({
  // Contact info (public form — no auth required)
  contactName:  { type: String, default: '', trim: true },
  phone:        { type: String, default: '', trim: true },
  email:        { type: String, default: '', trim: true, lowercase: true },
  teamName:     { type: String, default: '', trim: true },

  // Jersey type + server-computed pricing
  jerseyType:   { type: String, enum: ['sublimation', 'heat_press', 'embroidery'], default: 'sublimation' },
  players:      { type: [playerSchema], default: [] },
  unitPrice:    { type: Number, default: 0 },
  totalPrice:   { type: Number, default: 0 },

  notes:        { type: String, default: '', trim: true },
  status:       {
    type: String,
    enum: ['cho_xac_nhan', 'da_xac_nhan', 'dang_in', 'hoan_thanh', 'huy'],
    default: 'cho_xac_nhan',
  },

  // Legacy optional fields (kept for backward compat with old orders)
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:         { type: String, default: '' },
  playerName:   { type: String, default: '' },
  playerNumber: { type: String, default: '' },
  quantity:     { type: Number, default: 1 },
  totalEstimate:{ type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('PrintOrder', printOrderSchema);
