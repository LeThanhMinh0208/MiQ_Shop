import mongoose from 'mongoose';

const printOrderSchema = new mongoose.Schema({
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:           { type: String, required: true },
    phone:          { type: String, default: '' },
    email:          { type: String },
    jerseyType:     { type: String, default: 'custom' },
    teamName:       { type: String, default: '' },
    playerName:     { type: String, default: '' },
    playerNumber:   { type: String, default: '' },
    fontSize:       { type: String, default: 'standard' },
    fontStyle:      { type: String, default: 'block' },
    quantity:       { type: Number, default: 1 },
    sizes:          [{ size: String, qty: Number }],
    notes:          { type: String, default: '' },
    referenceImage: { type: String, default: '' }, // URL
    status:         { type: String, enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'], default: 'pending' },
    totalEstimate:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('PrintOrder', printOrderSchema);
