import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status:        { type: String, enum: ['open', 'closed'], default: 'open' },
    lastMessage:   String,
    lastMessageAt: Date,
    unreadAdmin:   { type: Number, default: 0 },
    unreadUser:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('ChatRoom', chatRoomSchema);
