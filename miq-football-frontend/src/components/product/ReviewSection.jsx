import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Loader, AlertCircle, CheckCircle, MessageSquare, ImagePlus, X as XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore.js';
import { useLanguageStore } from '../../store/languageStore.js';
import * as reviewService from '../../services/reviewService.js';
import ConfirmModal from '../ui/ConfirmModal.jsx';

const PER_PAGE = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STAR_KEYS = ['', 'starTerrible', 'starBad', 'starOk', 'starGood', 'starExcellent'];

const StarRow = ({ rating, size = 4 }) => (
    <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
            <Star
                key={s}
                style={{ width: size, height: size }}
                className={`${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-surface text-surface-border'}`}
            />
        ))}
    </div>
);

// ─── Star picker ──────────────────────────────────────────────────────────────

const StarPicker = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    const t = useLanguageStore((s) => s.t);
    const active = hovered || value;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button
                        key={s}
                        type="button"
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                    >
                        <Star
                            className={`w-9 h-9 transition-colors duration-100 ${
                                s <= active
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-surface text-surface-border'
                            }`}
                        />
                    </motion.button>
                ))}
            </div>
            <p className={`text-sm font-semibold transition-colors ${active ? 'text-amber-500' : 'text-text-muted'}`}>
                {STAR_KEYS[active] ? t(STAR_KEYS[active]) : ''}
            </p>
        </div>
    );
};

// ─── Rating distribution bar ──────────────────────────────────────────────────

const RatingBar = ({ star, count, total, delay }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-text-muted w-3 text-right">{star}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay, ease: 'easeOut' }}
                    className="h-full bg-amber-400 rounded-full"
                />
            </div>
            <span className="text-xs text-text-muted w-8">{pct}%</span>
            <span className="text-xs text-text-muted w-6 text-right">({count})</span>
        </div>
    );
};

// ─── Review card ──────────────────────────────────────────────────────────────

const ReviewCard = ({ review, currentUserId, onDelete, isNew }) => {
    const t = useLanguageStore((s) => s.t);
    const initials = (review.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const isOwner = currentUserId && review.user?.toString() === currentUserId?.toString();

    return (
        <motion.div
            layout
            initial={isNew ? { opacity: 0, y: -24 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-5"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0 border border-primary/20">
                        {initials}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm leading-tight text-text-primary">{review.name}</p>
                            {review.verifiedPurchase && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-1.5 py-0.5 rounded-full">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    Đã mua hàng
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-text-muted">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <StarRow rating={review.rating} size={16} />
                    {isOwner && (
                        <button
                            onClick={() => onDelete(review._id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition ml-1"
                            title={t('deleteReviewConfirm')}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <p className="mt-3 text-sm text-text-secondary leading-relaxed">{review.comment}</p>

            {review.images?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((img, i) => (
                        <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                            <img
                                src={img.url}
                                alt=""
                                loading="lazy"
                                className="w-16 h-16 object-cover rounded-lg border border-surface-border hover:opacity-80 transition"
                            />
                        </a>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ReviewSection = ({ productId, initialReviews = [], initialRatings }) => {
    const { user, isAuthenticated } = useAuthStore();
    const t = useLanguageStore((s) => s.t);

    const [reviews, setReviews] = useState(initialReviews);
    const [ratings, setRatings] = useState(
        initialRatings || { average: 0, count: 0 }
    );
    const [eligibility, setEligibility] = useState(null); // null = loading
    const [page, setPage] = useState(1);
    const [newReviewId, setNewReviewId] = useState(null);

    // Form state
    const [starValue, setStarValue] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [eligibilityLoading, setEligibilityLoading] = useState(false);
    const [reviewImages, setReviewImages] = useState([]);
    const [imgUploading, setImgUploading] = useState(false);
    const [deleteReviewTarget, setDeleteReviewTarget] = useState(null);
    const fileInputRef = useRef(null);

    const uploadReviewImage = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);
        fd.append('folder', 'reviews');
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: fd }
        );
        const json = await res.json();
        return { url: json.secure_url, publicId: json.public_id };
    };

    const handleImageFiles = async (files) => {
        const remaining = 3 - reviewImages.length;
        if (remaining <= 0) return;
        const toUpload = Array.from(files).slice(0, remaining);
        setImgUploading(true);
        try {
            const uploaded = await Promise.all(toUpload.map(uploadReviewImage));
            setReviewImages((prev) => [...prev, ...uploaded]);
        } catch {
            toast.error(t('error'));
        } finally {
            setImgUploading(false);
        }
    };

    // Fetch eligibility when logged in
    useEffect(() => {
        if (!isAuthenticated) { setEligibility(null); return; }
        setEligibilityLoading(true);
        reviewService
            .fetchEligibility(productId)
            .then(setEligibility)
            .catch(() => setEligibility({ canReview: false, myReview: null }))
            .finally(() => setEligibilityLoading(false));
    }, [productId, isAuthenticated]);

    // Pre-fill form if user already reviewed
    useEffect(() => {
        if (eligibility?.myReview) {
            setStarValue(eligibility.myReview.rating);
            setComment(eligibility.myReview.comment);
        } else {
            setStarValue(5);
            setComment('');
        }
    }, [eligibility]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim().length < 10) {
            toast.error(t('reviewTooShort'));
            return;
        }
        setSubmitting(true);
        try {
            const { review, ratings: newRatings } = await reviewService.submitReview(
                productId,
                { rating: starValue, comment: comment.trim(), images: reviewImages }
            );

            setReviews((prev) => {
                const idx = prev.findIndex((r) => r._id === review._id);
                if (idx >= 0) return prev.map((r, i) => (i === idx ? review : r));
                return [review, ...prev];
            });
            setRatings(newRatings);
            setEligibility((prev) => ({ ...prev, myReview: review }));
            setNewReviewId(review._id);
            setPage(1);

            setReviewImages([]);
            toast.success(
                eligibility?.myReview ? t('reviewUpdated') : t('reviewThanks'),
                { duration: 2500 }
            );
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        const reviewId = deleteReviewTarget;
        setDeleteReviewTarget(null);
        try {
            const { ratings: newRatings } = await reviewService.deleteReview(
                productId,
                reviewId
            );
            setReviews((prev) => prev.filter((r) => r._id !== reviewId));
            setRatings(newRatings);
            if (eligibility?.myReview?._id === reviewId) {
                setEligibility((prev) => ({ ...prev, myReview: null }));
                setComment('');
                setStarValue(5);
            }
            toast.success(t('reviewDeleted'));
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Derived data
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));
    const paginatedReviews = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(reviews.length / PER_PAGE);
    const isEditing = !!eligibility?.myReview;
    const commentLen = comment.trim().length;

    return (
        <section className="mt-20 scroll-mt-24" id="reviews">
            <ConfirmModal
                open={!!deleteReviewTarget}
                title="Xóa đánh giá"
                message={t('deleteReviewConfirm')}
                confirmLabel="Xóa đánh giá"
                danger
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteReviewTarget(null)}
            />
            <div className="flex items-center gap-3 mb-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold">{t('reviewsTitle')}</h2>
                <span className="text-sm font-semibold bg-surface px-3 py-1 rounded-full text-text-muted border border-surface-border">
                    {ratings.count}
                </span>
            </div>

            {/* ── Rating overview ────────────────────────────────── */}
            <div className="grid md:grid-cols-[180px_1fr] gap-6 bg-bg-elevated rounded-2xl border border-surface-border p-6 mb-8">
                <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-surface-border pb-4 md:pb-0 md:pr-6">
                    <span className="font-display text-6xl font-bold text-text-primary leading-none mb-2">
                        {ratings.average.toFixed(1)}
                    </span>
                    <StarRow rating={ratings.average} size={20} />
                    <p className="text-xs text-text-muted mt-2">{ratings.count} {t('reviewCountSuffix')}</p>
                </div>

                <div className="space-y-2 my-auto">
                    {distribution.map(({ star, count }, i) => (
                        <RatingBar
                            key={star}
                            star={star}
                            count={count}
                            total={ratings.count}
                            delay={i * 0.08}
                        />
                    ))}
                </div>
            </div>

            {/* ── Review form area ───────────────────────────────── */}
            {!isAuthenticated ? (
                <div className="bg-surface rounded-2xl border border-surface-border p-5 flex items-center gap-3 mb-8">
                    <AlertCircle className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <p className="text-sm text-text-muted">{t('loginToReviewMsg')}</p>
                </div>
            ) : eligibilityLoading ? (
                <div className="flex items-center gap-3 py-4 mb-8 text-text-muted">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t('checkingEligibility')}</span>
                </div>
            ) : eligibility && !eligibility.canReview ? (
                <div className="bg-surface rounded-2xl border border-surface-border p-5 flex items-center gap-3 mb-8">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-text-muted">{t('buyToReviewMsg')}</p>
                </div>
            ) : eligibility?.canReview ? (
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-bg-elevated rounded-2xl border border-primary/30 p-6 mb-8 shadow-sm"
                >
                    {/* Form header */}
                    <div className="flex items-center gap-2 mb-5">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <h3 className="font-display font-bold text-lg">
                            {isEditing ? t('updateReviewTitle') : t('writeReviewTitle')}
                        </h3>
                        {isEditing && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full font-semibold">
                                {t('editingBadge')}
                            </span>
                        )}
                    </div>

                    {/* Star picker */}
                    <div className="mb-5">
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-text-muted">
                            {t('satisfactionLevel')}
                        </label>
                        <StarPicker value={starValue} onChange={setStarValue} />
                    </div>

                    {/* Comment */}
                    <div className="mb-5">
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-text-muted">
                            {t('reviewCommentLabel')}{' '}
                            <span className="font-normal normal-case">({t('minCharsNote')})</span>
                        </label>
                        <textarea
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('reviewPlaceholder')}
                            className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm transition"
                        />
                        <div className="flex justify-between mt-1.5">
                            <p className={`text-xs ${commentLen >= 10 ? 'text-primary' : 'text-text-muted'}`}>
                                {commentLen >= 10 ? t('charEnough') : `${10 - commentLen}`}
                            </p>
                            <p className="text-xs text-text-muted">{commentLen}</p>
                        </div>
                    </div>

                    {/* Image upload */}
                    <div className="mb-5">
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-text-muted">
                            {t('reviewImages')} <span className="font-normal normal-case">({t('maxReviewImages')})</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {reviewImages.map((img, i) => (
                                <div key={i} className="relative group">
                                    <img src={img.url} alt="" className="w-16 h-16 object-cover rounded-lg border border-surface-border" />
                                    <button
                                        type="button"
                                        onClick={() => setReviewImages((prev) => prev.filter((_, j) => j !== i))}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {reviewImages.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={imgUploading}
                                    className="w-16 h-16 rounded-lg border-2 border-dashed border-surface-border hover:border-primary text-text-muted hover:text-primary flex items-center justify-center transition"
                                >
                                    {imgUploading ? <Loader className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleImageFiles(e.target.files)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || imgUploading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                            <Star className="w-4 h-4" />
                        )}
                        {isEditing ? t('updateReviewBtn') : t('sendReviewBtn')}
                    </button>
                </motion.form>
            ) : null}

            {/* ── Review list ────────────────────────────────────── */}
            {reviews.length === 0 ? (
                <div className="text-center py-16 text-text-muted">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold">{t('noReviews')}</p>
                    <p className="text-sm mt-1">{t('beFirstReview')}</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {paginatedReviews.map((review) => (
                                <ReviewCard
                                    key={review._id}
                                    review={review}
                                    currentUserId={user?._id}
                                    onDelete={setDeleteReviewTarget}
                                    isNew={review._id === newReviewId}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setPage(i + 1); setNewReviewId(null); }}
                                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                                        page === i + 1
                                            ? 'bg-primary text-white'
                                            : 'bg-bg-elevated border border-surface-border text-text-primary hover:border-primary'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default ReviewSection;
