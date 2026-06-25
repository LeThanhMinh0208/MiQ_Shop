import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    room:       { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    sender:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    content:    { type: String, required: true, maxlength: 1000 },
    read:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatMessageSchema.index({ room: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
