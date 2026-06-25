import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Tên người dùng là bắt buộc'], trim: true },
    email: { type: String, required: [true, 'Email là bắt buộc'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Mật khẩu là bắt buộc'], minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    stats: {
        totalSpent: { type: Number, default: 0 },
        orderCount: { type: Number, default: 0 },
        lastOrderAt: { type: Date, default: null },
    },
    addresses: [{
        label: String,
        fullName: String,
        phone: String,
        street: String,
        ward: String,
        district: String,
        city: String,
        isDefault: { type: Boolean, default: false },
    }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    // Tokens issued before this timestamp are invalid — set on every password change
    passwordChangedAt: { type: Date, select: true },
    // Hashed reset token + TTL — only populated during an active reset flow
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
    // Record change time so older tokens are rejected by the protect middleware.
    // Skip on first save (registration) — no tokens exist yet.
    if (!this.isNew) {
        // Subtract 1 s so the timestamp never lands in the same JWT-second as a
        // freshly issued token, which would prevent the new token from working.
        this.passwordChangedAt = new Date(Date.now() - 1000);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;