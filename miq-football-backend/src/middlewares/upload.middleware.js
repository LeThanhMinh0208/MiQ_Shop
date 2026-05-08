import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

export const createUploader = (folderName, transformations = []) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `miq-football/${folderName}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
                ...transformations,
            ],
        },
    });

    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Chỉ được upload file ảnh'), false);
            }
            cb(null, true);
        },
    });
};

export const uploadProductImages = createUploader('products', [
    { width: 800, height: 800, crop: 'limit' },
]);

export const uploadAvatar = createUploader('avatars', [
    { width: 200, height: 200, crop: 'fill', gravity: 'face' },
]);