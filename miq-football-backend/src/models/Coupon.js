import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:        { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: {
        type: Number,
        required: true,
        min: [0, 'Giá trị coupon phải >= 0'],
        validate: {
            validator: function (v) {
                // Percent coupons must not exceed 100
                return this.type !== 'percent' || v <= 100;
            },
            message: 'Coupon phần trăm không được vượt quá 100%',
        },
    }, // percent: 0-100, fixed: amount in VND
    minOrder:    { type: Number, default: 0 },       // minimum order value to apply
    maxDiscount: { type: Number, default: null },     // max discount for percent type
    usageLimit:  { type: Number, default: null },     // null = unlimited
    usedCount:   { type: Number, default: 0 },
    expiresAt:   { type: Date, default: null },
    isActive:    { type: Boolean, default: true },
    description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
