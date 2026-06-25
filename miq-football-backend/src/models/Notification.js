import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['new-order', 'order-cancelled', 'order-status-update', 'new-print-order', 'chat', 'system'],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    data:    mongoose.Schema.Types.Mixed,
    link:    String,
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
