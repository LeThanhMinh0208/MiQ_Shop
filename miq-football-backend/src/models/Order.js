import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    customization: {
        name:   { type: String, default: '' },
        number: { type: String, default: '' },
    },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        ward: String,
        district: { type: String, required: true },
        city: { type: String, required: true },
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    coupon: {
        code:     { type: String, default: null },
        discount: { type: Number, default: 0 },
    },
    totalPrice: { type: Number, required: true },
    payment: {
        method: { type: String, enum: ['stripe', 'cod'], default: 'stripe' },
        stripePaymentIntentId: String,
        stripeEventId: String,   // webhook event.id that confirmed payment (idempotency key)
        isPaid: { type: Boolean, default: false },
        paidAt: Date,
        refundId: String,        // Stripe refund id
        refundedAt: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending',
    },
    statusHistory: [{
        status: String,
        note: String,
        updatedAt: { type: Date, default: Date.now },
    }, ],
    notes: String,
    idempotencyKey: { type: String },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;