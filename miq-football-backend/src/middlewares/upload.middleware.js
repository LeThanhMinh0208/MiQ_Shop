import { Readable } from 'node:stream';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/apiResponse.js';

// Only these MIME types are accepted — `image/svg+xml`, `image/gif`, etc. are
// explicitly excluded. SVG is omitted because it can embed `<script>` tags and
// cause stored-XSS when served from the same origin.
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_FMT  = ['jpg', 'jpeg', 'png', 'webp'];

// ── multer: buffer in memory, fast MIME type pre-check ───────────────────────
// This is the client-declared type check (quick, but spoofable).
// The magic-bytes check in uploadToCloudinary() is the real gate.
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
        return cb(new ApiError(400, 'Chỉ được upload ảnh JPEG, PNG hoặc WebP'), false);
    }
    cb(null, true);
};

const memStorage = multer.memoryStorage();

const multerBase = multer({
    storage: memStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
});

// ── Cloudinary upload with magic-bytes validation ────────────────────────────
// Reads the actual file signature (not the client-declared Content-Type) to
// reject files that have been renamed or whose MIME header was spoofed.
async function uploadToCloudinary(buffer, folder, transforms) {
    // Magic-bytes check — defeats spoofed Content-Type headers
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !ALLOWED_MIME.has(detected.mime)) {
        throw new ApiError(400, 'File thực tế không phải ảnh hợp lệ (JPEG, PNG hoặc WebP)');
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder:          `miq-football/${folder}`,
                allowed_formats: ALLOWED_FMT,
                transformation:  transforms,
            },
            (err, result) => (err ? reject(err) : resolve(result)),
        );
        Readable.from(buffer).pipe(stream);
    });
}

// ── Composite middleware factory ─────────────────────────────────────────────
// Returns an object whose .single(field) and .array(field, max) methods each
// produce a [multerMiddleware, cloudinaryMiddleware] pair that can be spread
// into Express route definitions:
//   router.put('/:id', ...uploadProductImages.array('images', 5), controller)
//
// The cloudinary middleware patches req.file.path / req.file.filename
// (or the same on each req.files entry) so all existing controllers work
// unchanged — they still read req.file.path for the URL and
// req.file.filename for the public_id.
export const createUploader = (folderName, transformations = []) => {
    const cloudTransforms = [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        ...transformations,
    ];

    // Post-multer middleware: magic-bytes check + Cloudinary upload
    const afterUpload = (isSingle) => async (req, res, next) => {
        const files = isSingle
            ? (req.file  ? [req.file]  : [])
            : (req.files || []);

        if (files.length === 0) return next();

        try {
            const results = await Promise.all(
                files.map((f) => uploadToCloudinary(f.buffer, folderName, cloudTransforms)),
            );

            if (isSingle) {
                req.file.path     = results[0].secure_url;
                req.file.filename = results[0].public_id;
            } else {
                req.files.forEach((f, i) => {
                    f.path     = results[i].secure_url;
                    f.filename = results[i].public_id;
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };

    return {
        single: (field)       => [multerBase.single(field),       afterUpload(true)],
        array:  (field, max)  => [multerBase.array(field, max),   afterUpload(false)],
    };
};

// ── Named uploaders ───────────────────────────────────────────────────────────
export const uploadProductImages = createUploader('products', [
    { width: 800, height: 800, crop: 'limit' },
]);

export const uploadAvatar = createUploader('avatars', [
    { width: 200, height: 200, crop: 'fill', gravity: 'face' },
]);

export const uploadCategoryImage = createUploader('categories', [
    { width: 400, height: 400, crop: 'fill' },
]);
