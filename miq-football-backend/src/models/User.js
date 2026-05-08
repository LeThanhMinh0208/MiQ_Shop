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
    }, ],
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;