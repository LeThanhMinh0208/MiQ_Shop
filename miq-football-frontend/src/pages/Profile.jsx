import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, MapPin, Heart, Lock, Eye, EyeOff,
  Check, CheckCircle2, Loader, LogOut, Plus, Trash2, X, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { useLanguageStore } from '../store/languageStore.js';
import * as profileService from '../services/profileService.js';
import { fetchMyOrders, cancelOrder } from '../services/orderService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

const avatarUrl = (user) =>
  user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=E8590C&color=fff&size=128`;

const STATUS_COLORS = {
  pending:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  shipping:  'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const EMPTY_ADDRESS = { label: '', fullName: '', phone: '', city: '', district: '', ward: '', street: '', isDefault: false };

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const t = useLanguageStore((s) => s.t);
  const KEY_MAP = {
    pending:   'orderStatusPending',
    confirmed: 'orderStatusConfirmed',
    shipping:  'orderStatusShipping',
    delivered: 'orderStatusDelivered',
    cancelled: 'orderStatusCancelled',
  };
  return (
    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[status] ?? 'bg-surface text-text-muted border-surface-border'}`}>
      {t(KEY_MAP[status] ?? status)}
    </span>
  );
};

// ─── Tab: Thông tin cá nhân ───────────────────────────────────────────────────
const TabInfo = ({ user, onUserUpdate }) => {
  const t = useLanguageStore((s) => s.t);
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const updated = await profileService.uploadAvatar(fd);
      onUserUpdate(updated);
      toast.success(t('avatarUpdated'));
    } catch (err) {
      toast.error(err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error(t('nameRequired')); return; }
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(form);
      onUserUpdate(updated);
      toast.success(t('profileUpdated'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">{t('personalInfo')}</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <label className="relative cursor-pointer group">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-border group-hover:border-primary/50 transition">
            {uploading
              ? <div className="w-full h-full bg-surface flex items-center justify-center"><Loader className="w-5 h-5 animate-spin text-primary" /></div>
              : <img src={preview || avatarUrl(user)} alt={user.name} className="w-full h-full object-cover" />
            }
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
        <div>
          <p className="font-semibold text-text-primary">{user.name}</p>
          <p className="text-xs text-text-muted mt-1">{t('avatarHint')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-text-muted">{t('fullNameLabel')}</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-text-muted">{t('email')}</label>
          <input
            value={form.email}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface text-text-muted cursor-not-allowed"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {t('saveChanges')}
        </button>
      </form>

      {/* Stats */}
      {user.stats && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-surface-border max-w-md">
          {[
            { label: t('totalOrdersStat'), value: user.stats.orderCount || 0 },
            { label: t('totalSpent'), value: formatCurrency(user.stats.totalSpent || 0) },
            { label: t('lastOrderStat'), value: user.stats.lastOrderAt ? new Date(user.stats.lastOrderAt).toLocaleDateString('vi-VN') : '—' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-bold text-text-primary text-lg">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Đơn hàng ────────────────────────────────────────────────────────────
const TabOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null); // orderId awaiting confirmation
  const t = useLanguageStore((s) => s.t);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => toast.error(t('loadOrdersError')))
      .finally(() => setLoading(false));
  }, []);

  const filterButtons = [
    { value: 'all',       labelKey: 'tabAll' },
    { value: 'pending',   labelKey: 'orderStatusPending' },
    { value: 'confirmed', labelKey: 'orderStatusConfirmed' },
    { value: 'shipping',  labelKey: 'orderStatusShipping' },
    { value: 'delivered', labelKey: 'orderStatusDelivered' },
    { value: 'cancelled', labelKey: 'orderStatusCancelled' },
  ];

  const handleCancelOrder = async () => {
    const orderId = cancelTarget;
    setCancelTarget(null);
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success(t('orderCancelled'));
    } catch (err) {
      toast.error(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {cancelTarget && (
        <ConfirmModal
          title="Hủy đơn hàng"
          message="Bạn có chắc muốn hủy đơn này? Hành động này không thể hoàn tác sau khi xác nhận."
          confirmLabel="Hủy đơn hàng"
          danger
          onConfirm={handleCancelOrder}
          onCancel={() => setCancelTarget(null)}
        />
      )}
      <h2 className="font-display text-2xl font-bold mb-6">{t('myOrders')}</h2>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filterButtons.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === f.value
                ? 'bg-primary text-white border-primary'
                : 'bg-bg-elevated border-surface-border text-text-primary hover:border-primary'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-8 h-8 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold">{t('noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExpanded = expandedId === order._id;
            return (
              <div key={order._id} className="bg-bg-raised rounded-2xl border border-surface-border overflow-hidden">
                {/* Header row */}
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface transition"
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-text-muted font-medium">#MIQ-{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm font-bold text-text-primary">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <StatusBadge status={order.status} />
                    <span className="text-xs text-text-muted hidden sm:inline">{order.items.length} {t('products')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{formatCurrency(order.totalPrice)}</span>
                    <span className="text-text-muted text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-surface-border"
                    >
                      <div className="px-5 py-4 space-y-4">
                        {/* Items */}
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-surface rounded-xl p-1 flex-shrink-0">
                                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary line-clamp-1">{item.name}</p>
                                <p className="text-xs text-text-muted">Size {item.size} × {item.quantity}</p>
                                {item.customization && (item.customization.name || item.customization.number) && (
                                  <p className="text-[11px] text-blue-400 font-semibold mt-0.5">
                                    In: {item.customization.name}{item.customization.number ? ` #${item.customization.number}` : ''}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm font-bold text-text-primary">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Address */}
                        {order.shippingAddress && (
                          <div className="bg-surface rounded-xl px-4 py-3 text-sm text-text-muted">
                            <span className="font-semibold text-text-primary">{t('deliverTo')}: </span>
                            {[order.shippingAddress.fullName, order.shippingAddress.phone, order.shippingAddress.street, order.shippingAddress.ward, order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(', ')}
                          </div>
                        )}

                        {/* Totals */}
                        <div className="text-sm space-y-1 pt-2 border-t border-surface-border">
                          <div className="flex justify-between text-text-muted">
                            <span>{t('subtotal')}</span><span>{formatCurrency(order.itemsPrice)}</span>
                          </div>
                          <div className="flex justify-between text-text-muted">
                            <span>{t('shipping')}</span>
                            <span>{order.shippingPrice === 0 ? <span className="text-primary font-semibold">{t('free')}</span> : formatCurrency(order.shippingPrice)}</span>
                          </div>
                          {order.coupon?.discount > 0 && (
                            <div className="flex justify-between text-primary">
                              <span>{order.coupon.code}</span><span>-{formatCurrency(order.coupon.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold pt-1 border-t border-surface-border">
                            <span>{t('total')}</span><span className="text-primary">{formatCurrency(order.totalPrice)}</span>
                          </div>
                        </div>

                        {/* Cancel button + eligibility note (#17) */}
                        {['pending', 'confirmed'].includes(order.status) && (
                          <div className="pt-2 border-t border-surface-border space-y-2">
                            <p className="text-xs text-text-muted">
                              Chỉ đơn ở trạng thái <span className="font-semibold text-amber-400">Chờ xử lý</span> hoặc <span className="font-semibold text-blue-400">Đã xác nhận</span> mới có thể hủy. Sau khi đơn được giao cho shipper, không thể hủy.
                            </p>
                            <div className="flex justify-end">
                              <button
                                onClick={(e) => { e.stopPropagation(); setCancelTarget(order._id); }}
                                disabled={cancellingId === order._id}
                                className="flex items-center gap-1.5 text-red-500 border border-red-500/30 hover:bg-red-500/5 px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                              >
                                {cancellingId === order._id
                                  ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                  : <X className="w-3.5 h-3.5" />}
                                {cancellingId === order._id ? t('cancelling') : t('cancelOrder')}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Địa chỉ ─────────────────────────────────────────────────────────────
const TabAddresses = ({ user, onUserUpdate }) => {
  const [addresses, setAddresses] = useState(user.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [deleteAddrTarget, setDeleteAddrTarget] = useState(null);
  const t = useLanguageStore((s) => s.t);

  const sync = (updatedAddresses) => { setAddresses(updatedAddresses); onUserUpdate({ ...user, addresses: updatedAddresses }); };

  const openAdd  = () => { setForm(EMPTY_ADDRESS); setEditId(null); setShowForm(true); };
  const openEdit = (addr) => { setForm({ label: addr.label, fullName: addr.fullName, phone: addr.phone, city: addr.city, district: addr.district, ward: addr.ward, street: addr.street, isDefault: addr.isDefault }); setEditId(addr._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = editId ? await profileService.updateAddress(editId, form) : await profileService.addAddress(form);
      sync(updated);
      setShowForm(false);
      toast.success(editId ? t('addressUpdated') : t('addressAdded'));
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    const id = deleteAddrTarget;
    setDeleteAddrTarget(null);
    try {
      const updated = await profileService.deleteAddress(id);
      sync(updated);
      toast.success(t('addressDeleted'));
    } catch (err) { toast.error(err.message); }
  };

  const handleSetDefault = async (id) => {
    try {
      const updated = await profileService.updateAddress(id, { isDefault: true });
      sync(updated);
      toast.success(t('defaultSet'));
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <ConfirmModal
        open={!!deleteAddrTarget}
        title="Xóa địa chỉ"
        message={t('deleteAddressConfirm')}
        confirmLabel="Xóa địa chỉ"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteAddrTarget(null)}
      />
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">{t('myAddresses')}</h2>
        {!showForm && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm">
            <Plus className="w-4 h-4" /> {t('addAddress')}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-surface-border p-6 mb-6 space-y-4">
          <h3 className="font-display font-bold text-lg">{editId ? t('editAddress') : t('addNewAddress')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-text-muted">{t('addressLabel')}</label>
              <input required placeholder={t('addressLabelPlaceholder')} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-text-muted">{t('recipientName')}</label>
              <input required placeholder="Nguyễn Văn A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-text-muted">{t('phone')}</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-text-muted">{t('province')}</label>
              <input required placeholder="TP. Hồ Chí Minh" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-text-muted">{t('district')}</label>
              <input required placeholder="Quận 1" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-text-muted">{t('ward')}</label>
              <input required placeholder="Phường Bến Nghé" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 text-text-muted">{t('streetDetail')}</label>
            <input required placeholder="123 Lê Lợi" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
            <span className="text-sm font-medium">{t('setAsDefault')}</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60 !py-2.5">
              {saving && <Loader className="w-4 h-4 animate-spin" />}
              {editId ? t('saveChanges') : t('addAddress')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline !py-2.5">{t('cancel')}</button>
          </div>
        </form>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 text-text-muted">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-semibold">{t('noAddresses')}</p>
          <p className="text-sm mt-1">{t('addAddressHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-bg-raised rounded-2xl border border-surface-border p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-text-primary text-sm">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold border border-primary/20">{t('defaultBadge')}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-text-primary">{addr.fullName} · {addr.phone}</p>
                <p className="text-sm text-text-muted mt-0.5">{[addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr._id)} className="text-xs text-primary border border-primary/30 hover:bg-primary/5 px-2.5 py-1 rounded-lg transition font-medium">{t('setDefault')}</button>
                )}
                <button onClick={() => openEdit(addr)} title={t('edit')} className="p-1.5 text-text-muted hover:text-primary transition"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteAddrTarget(addr._id)} title={t('delete')} className="p-1.5 text-text-muted hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Wishlist ────────────────────────────────────────────────────────────
const TabWishlist = () => {
  const t = useLanguageStore((s) => s.t);
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">{t('wishlist')}</h2>
      <div className="flex flex-col items-center justify-center py-24 text-text-muted">
        <div className="w-20 h-20 rounded-full bg-bg-raised flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-primary/40" />
        </div>
        <p className="font-display font-bold text-xl mb-1">{t('wishlistComingSoon')}</p>
        <p className="text-sm text-center max-w-xs">{t('wishlistDevMsg')}</p>
      </div>
    </div>
  );
};

// ─── Tab: Đổi mật khẩu ───────────────────────────────────────────────────────
const TabPassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const t = useLanguageStore((s) => s.t);

  const toggleShow = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error(t('passwordMismatch')); return; }
    if (form.newPassword.length < 8) { toast.error(t('passwordTooShort')); return; }
    setLoading(true);
    try {
      await profileService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success(t('passwordChanged'));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const fields = [
    { labelKey: 'currentPassword', field: 'currentPassword', showKey: 'current' },
    { labelKey: 'newPassword', field: 'newPassword', showKey: 'new' },
    { labelKey: 'confirmNewPassword', field: 'confirmPassword', showKey: 'confirm' },
  ];

  return (
    <div className="max-w-md">
      <h2 className="font-display text-2xl font-bold mb-6">{t('changePassword')}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map(({ labelKey, field, showKey }) => (
          <div key={field}>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-text-muted">{t(labelKey)}</label>
            <div className="relative">
              <input
                type={show[showKey] ? 'text' : 'password'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                required
              />
              <button type="button" onClick={() => toggleShow(showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition">
                {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
        <PasswordStrengthMeter password={form.newPassword} />
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {t('changePassword')}
        </button>
      </form>
    </div>
  );
};

// ─── TABS config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'info',      labelKey: 'personalInfo',  icon: User },
  { id: 'orders',    labelKey: 'myOrders',       icon: Package },
  { id: 'addresses', labelKey: 'myAddresses',    icon: MapPin },
  { id: 'password',  labelKey: 'changePassword', icon: Lock },
];

// ─── Password strength meter (shared with Register) ──────────────────────────
const PasswordStrengthMeter = ({ password }) => {
  const t = useLanguageStore((s) => s.t);
  if (!password) return null;
  const checks = [
    { label: '8+ ký tự',    ok: password.length >= 8 },
    { label: 'Chữ hoa',     ok: /[A-Z]/.test(password) },
    { label: 'Số',          ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const bar   = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'][score] || '';
  const label = ['', t('weak'), t('medium'), t('strong')][score] || '';
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? bar : 'bg-surface-border'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.ok ? 'text-emerald-500' : 'text-text-muted'}`}>
              <CheckCircle2 className="w-3 h-3" /> {c.label}
            </span>
          ))}
        </div>
        <span className={`text-[10px] font-bold ${bar.replace('bg-', 'text-')}`}>{label}</span>
      </div>
    </div>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────────────
const Profile = () => {
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const { user, setUser, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useLanguageStore((s) => s.t);

  useEffect(() => { checkAuth().finally(() => setChecking(false)); }, []);

  // Auto-switch tab when navigated with state (e.g. from OrderSuccess)
  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-10 h-10 text-primary animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = async () => { await logout(); navigate('/'); };
  const handleUserUpdate = (updatedUser) => setUser(updatedUser);

  return (
    <div className="min-h-screen bg-bg-raised py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>{t('home')}</span>
          <span>/</span>
          <span className="text-text-primary font-medium">{t('account')}</span>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-bg-elevated rounded-2xl border border-surface-border p-5 text-center shadow-sm">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-surface-border">
                <img src={avatarUrl(user)} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-display font-bold text-base leading-tight">{user.name}</p>
              <p className="text-xs text-text-muted mt-1 break-all">{user.email}</p>
              {user.role === 'admin' && (
                <span className="mt-2 inline-block text-[11px] bg-primary text-white px-2.5 py-0.5 rounded-full font-semibold">Admin</span>
              )}
            </div>

            <nav className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden shadow-sm">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition text-left border-b border-surface-border last:border-0 relative ${isActive ? 'text-primary bg-primary/5' : 'text-text-primary hover:bg-bg-raised'}`}
                  >
                    {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />}
                    <tab.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                    {t(tab.labelKey)}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-500/5 transition text-left border-t border-surface-border"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {t('signOut')}
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main className="bg-bg-elevated rounded-2xl border border-surface-border p-8 shadow-sm min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'info'      && <TabInfo user={user} onUserUpdate={handleUserUpdate} />}
                {activeTab === 'orders'    && <TabOrders />}
                {activeTab === 'addresses' && <TabAddresses user={user} onUserUpdate={handleUserUpdate} />}
                {activeTab === 'password'  && <TabPassword />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
