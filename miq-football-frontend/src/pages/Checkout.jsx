import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CreditCard, Loader, Tag, X, Check, ChevronDown, MapPin, Plus, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useLanguageStore } from '../store/languageStore.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import AddressForm, { VN_PHONE_RE } from '../components/checkout/AddressForm.jsx';
import { getCities } from '../data/vnAddress.js';

const CITIES = getCities();
import { createOrder, createPaymentIntent as createPaymentIntentAPI, validateCartStock } from '../services/orderService.js';
import { validateCoupon } from '../services/couponService.js';
import { addAddress } from '../services/profileService.js';

// Initialised once at module level — never recreated on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe Elements appearance — matches the app's dark theme
const stripeAppearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#E8590C',
    colorBackground: '#18181b',
    colorText: '#f3f4f6',
    colorDanger: '#ef4444',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    borderRadius: '10px',
  },
};

const EMPTY_ADDRESS = { fullName: '', phone: '', street: '', ward: '', district: '', city: '' };

// ── Saved address picker ─────────────────────────────────────────────────────
const AddressPicker = ({ addresses, selected, onSelect, onNewAddress }) => {
  const [open, setOpen] = useState(false);
  if (!addresses || addresses.length === 0) return null;
  const current = addresses.find((a) => a._id === selected) || addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-primary" /> Địa chỉ đã lưu
      </p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-bg-raised border border-surface-border rounded-xl text-left hover:border-primary/50 transition"
        >
          <div className="min-w-0">
            <p className="font-semibold text-sm text-text-primary truncate">{current?.fullName}</p>
            <p className="text-xs text-text-muted truncate">
              {current?.phone} · {[current?.street, current?.district, current?.city].filter(Boolean).join(', ')}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-surface-border rounded-xl shadow-depth-lg z-20 overflow-hidden"
            >
              {addresses.map((addr) => (
                <button
                  key={addr._id} type="button"
                  onClick={() => { onSelect(addr); setOpen(false); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-surface-border last:border-0 transition hover:bg-bg-raised ${addr._id === selected ? 'bg-primary/5' : ''}`}
                >
                  <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${addr._id === selected ? 'text-primary' : 'text-text-muted'}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-text-primary">
                      {addr.fullName}
                      {addr.isDefault && <span className="ml-2 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">Mặc định</span>}
                    </p>
                    <p className="text-xs text-text-muted">{addr.phone}</p>
                    <p className="text-xs text-text-muted truncate">
                      {[addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {addr._id === selected && <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0 mt-0.5" />}
                </button>
              ))}
              <button
                type="button" onClick={() => { onNewAddress(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary font-bold hover:bg-primary/5 transition"
              >
                <Plus className="w-4 h-4" /> Nhập địa chỉ mới
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Stripe payment form (must be inside <Elements> provider) ─────────────────
const StripePaymentForm = ({ orderId, total, onSuccess }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // return_url is used when Stripe needs to redirect (e.g. 3D Secure)
        return_url: `${window.location.origin}/order-pending?orderId=${orderId}`,
      },
      // Don't redirect for cards that don't require 3DS — handle result here
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    // Payment confirmed without redirect — webhook will mark the order paid
    if (result.paymentIntent?.status === 'succeeded') {
      onSuccess();
    }
    // status === 'processing' → browser was redirected; shouldn't reach here
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Thanh toán {formatCurrency(total)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-text-muted">
        🔒 Thanh toán bảo mật qua Stripe · Dữ liệu thẻ được mã hóa
      </p>
    </form>
  );
};

// ── Main checkout ────────────────────────────────────────────────────────────
const Checkout = () => {
  const navigate        = useNavigate();
  const navigatingRef   = useRef(false); // prevents the empty-cart redirect after clearCart()+navigate
  const { items, getTotalPrice, clearCart, _hasHydrated } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const t = useLanguageStore((s) => s.t);

  const [loading, setLoading]               = useState(false);
  const [paymentMethod, setPaymentMethod]   = useState('cod');
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [useNewAddress, setUseNewAddress]   = useState(false);
  const [address, setAddress]               = useState(EMPTY_ADDRESS);
  const [notes, setNotes]                   = useState('');
  const [couponCode, setCouponCode]         = useState('');
  const [couponResult, setCouponResult]     = useState(null);
  const [couponLoading, setCouponLoading]   = useState(false);
  // Generated once per checkout session — deduplicates double-submits and network retries
  const [idempotencyKey]                    = useState(() => crypto.randomUUID());

  // Stripe two-step state
  const [checkoutStep, setCheckoutStep]         = useState('details'); // 'details' | 'payment'
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId]     = useState(null);

  const [phoneError, setPhoneError]             = useState('');

  // Stock pre-check — friendly warning before the hard server-side atomic check
  const [stockIssues, setStockIssues]           = useState([]);
  const [saveAddress, setSaveAddress]           = useState(false);

  const savedAddresses = user?.addresses || [];
  const hasAddresses   = savedAddresses.length > 0;

  useEffect(() => {
    if (!user) return;
    setAddress((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || '',
      phone:    prev.phone    || user.phone || '',
    }));
    if (hasAddresses) {
      const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddrId(def._id);
      setUseNewAddress(false);
      applyAddress(def);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Pre-flight stock check — runs once both cart data and auth are ready.
  // With []: ran on mount before localStorage was read → always saw items=[].
  // Now depends on _hasHydrated (cart ready) and isAuthenticated (CSRF cookie
  // guaranteed after the auth GET that set it), so the POST can go through.
  useEffect(() => {
    if (!isAuthenticated || !_hasHydrated || items.length === 0) return;
    const cartItems = items.map((i) => ({ product: i.productId, size: i.size, quantity: i.quantity }));
    validateCartStock(cartItems)
      .then(({ allOk, items: checked }) => {
        if (!allOk) setStockIssues(checked.filter((c) => !c.ok));
      })
      .catch(() => {}); // non-fatal — server will catch it on submit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, isAuthenticated]);

  const applyAddress = (addr) => {
    setAddress({
      fullName: addr.fullName || '',
      phone:    addr.phone    || '',
      street:   addr.street   || '',
      ward:     addr.ward     || '',
      district: addr.district || '',
      city:     addr.city     || addr.province || '',
    });
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddrId(addr._id);
    setUseNewAddress(false);
    applyAddress(addr);
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const discount = couponResult?.discount || 0;
  const total    = subtotal + shipping - discount;

  // Redirect to cart when empty — but only after Zustand has finished reading
  // localStorage (_hasHydrated). Without that guard, the first render (before
  // localStorage is read) sees items=[] and bounces the user away.
  // The loading guard prevents bouncing while an order is in flight.
  // The navigatingRef guard prevents bouncing when clearCart() empties the cart
  // right before navigate('/order-success') — the try-finally setLoading(false)
  // fires after return and would otherwise trigger this effect with loading=false.
  useEffect(() => {
    if (_hasHydrated && items.length === 0 && !loading && !navigatingRef.current) {
      navigate('/cart');
    }
  }, [_hasHydrated, items.length, loading, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      setCouponResult(result);
      toast.success(t('couponApplied'));
    } catch (err) {
      setCouponResult(null);
      toast.error(err.message || t('couponInvalid'));
    } finally {
      setCouponLoading(false);
    }
  };

  const validateAddress = () => {
    const missing = [
      !address.fullName?.trim()  && 'Họ tên',
      !address.phone?.trim()     && 'Số điện thoại',
      !address.street?.trim()    && 'Địa chỉ',
      !address.district?.trim()  && 'Quận/Huyện',
      !address.city?.trim()      && 'Tỉnh/Thành phố',
    ].filter(Boolean);

    // Legacy address: stored city name not in current dataset — AddressForm also
    // blocks via a hidden required sentinel, but this JS check catches programmatic
    // submit paths (tests, keyboard shortcuts) that bypass native form validation.
    if (address.city?.trim() && !CITIES.some((c) => c.name === address.city.trim())) {
      missing.push('Tỉnh/Thành phố hợp lệ');
    }

    // Inline phone check
    if (address.phone?.trim() && !VN_PHONE_RE.test(address.phone.trim())) {
      setPhoneError('Số điện thoại không hợp lệ (VD: 0912345678)');
      missing.push('Số điện thoại hợp lệ');
    } else {
      setPhoneError('');
    }

    return missing;
  };

  // ── COD + first step of Stripe ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    const missing = validateAddress();
    if (missing.length > 0) {
      toast.error(`Vui lòng điền: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Re-validate stock immediately before submitting — catches items that
      // sold out while the user was filling out the form.
      const cartItems = items.map((i) => ({ product: i.productId, size: i.size, quantity: i.quantity }));
      try {
        const { allOk, items: checked } = await validateCartStock(cartItems);
        if (!allOk) {
          const issues = checked.filter((c) => !c.ok);
          setStockIssues(issues);
          toast.error(issues[0]?.reason || 'Một số sản phẩm đã hết hàng');
          setLoading(false);
          return;
        }
        setStockIssues([]);
      } catch {
        // If the validate endpoint is unavailable, let the order attempt proceed —
        // the server-side atomic decrement will reject oversold items anyway.
      }

      const orderData = {
        items: items.map((i) => ({
          product:  i.productId,
          name:     i.name,
          image:    i.image,
          price:    i.price,   // server re-prices from DB; this is ignored server-side
          size:     i.size,
          quantity: i.quantity,
          ...(i.customization && { customization: i.customization }),
        })),
        shippingAddress: address,
        paymentMethod,
        notes,
        idempotencyKey,
        ...(couponResult && { couponCode: couponCode.trim().toUpperCase() }),
      };

      const order = await createOrder(orderData);

      if (saveAddress && !hasAddresses) {
        addAddress({ ...address, isDefault: true }).catch(() => {});
      }

      if (paymentMethod === 'cod') {
        // COD: order is done — navigate straight to success.
        // Set ref before clearCart so the empty-cart useEffect doesn't fire
        // when finally{setLoading(false)} runs after this return.
        navigatingRef.current = true;
        clearCart();
        navigate('/order-success', { state: { orderId: order._id } });
        return;
      }

      // Stripe: get client_secret and switch to the payment step
      const { clientSecret } = await createPaymentIntentAPI(order._id);
      setPendingOrderId(order._id);
      setStripeClientSecret(clientSecret);
      setCheckoutStep('payment');
    } catch (err) {
      toast.error(err.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Called by StripePaymentForm on success (paymentIntent.status === 'succeeded')
  const handlePaymentSuccess = () => {
    navigatingRef.current = true;
    clearCart();
    navigate('/order-pending', { state: { orderId: pendingOrderId } });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-base pt-8 pb-28 lg:pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-8">
          {checkoutStep === 'payment' ? 'THANH TOÁN' : t('checkout').toUpperCase()}
        </h1>

        {/* Step indicator — Rule 22 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-white">
              1
            </div>
            <span className={`text-sm hidden sm:inline font-semibold ${checkoutStep === 'details' ? 'text-text-primary' : 'text-text-muted'}`}>
              Địa chỉ & Thanh toán
            </span>
          </div>
          {/* Step 2 only exists for the Stripe flow — COD is single-step */}
          {paymentMethod === 'stripe' && (
            <>
              <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${checkoutStep === 'payment' ? 'bg-primary' : 'bg-surface-border'}`} />
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                  checkoutStep === 'payment' ? 'bg-primary text-white border-primary' : 'border-surface-border text-text-muted'
                }`}>
                  2
                </div>
                <span className={`text-sm hidden sm:inline font-semibold ${checkoutStep === 'payment' ? 'text-text-primary' : 'text-text-muted'}`}>
                  Nhập thông tin thẻ
                </span>
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* LEFT column */}
          <div>
            {/* ── Step: Stripe payment form ─────────────────────────────── */}
            {checkoutStep === 'payment' && stripeClientSecret && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-bg-elevated rounded-2xl p-6 border border-surface-border"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-xl font-bold text-text-primary">NHẬP THÔNG TIN THẺ</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCheckoutStep('details'); setStripeClientSecret(null); setPendingOrderId(null); }}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Chỉnh sửa địa chỉ
                  </button>
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: stripeAppearance }}>
                  <StripePaymentForm
                    orderId={pendingOrderId}
                    total={total}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </motion.div>
            )}

            {/* ── Step: order details form ──────────────────────────────── */}
            {checkoutStep === 'details' && (
              <form onSubmit={handleSubmit} className="space-y-6" id="checkout-form">
                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-elevated rounded-2xl p-6 border border-surface-border"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-xl font-bold text-text-primary">{t('shippingInfo').toUpperCase()}</h2>
                  </div>

                  {hasAddresses && !useNewAddress && (
                    <AddressPicker
                      addresses={savedAddresses} selected={selectedAddrId}
                      onSelect={handleSelectSavedAddress}
                      onNewAddress={() => {
                        setUseNewAddress(true);
                        setAddress({ fullName: user?.name || '', phone: '', street: '', ward: '', district: '', city: '' });
                      }}
                    />
                  )}

                  {(!hasAddresses || useNewAddress) && (
                    <>
                      {useNewAddress && (
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-text-primary">Địa chỉ mới</span>
                          <button
                            type="button"
                            onClick={() => { setUseNewAddress(false); handleSelectSavedAddress(savedAddresses.find((a) => a._id === selectedAddrId) || savedAddresses[0]); }}
                            className="text-xs text-primary hover:underline"
                          >
                            ← Dùng địa chỉ đã lưu
                          </button>
                        </div>
                      )}
                      <AddressForm
                        data={address}
                        onChange={(v) => { setAddress(v); if (phoneError) setPhoneError(''); }}
                        phoneError={phoneError}
                        onPhoneBlur={() => {
                          if (address.phone?.trim() && !VN_PHONE_RE.test(address.phone.trim())) {
                            setPhoneError('Số điện thoại không hợp lệ (VD: 0912345678)');
                          } else {
                            setPhoneError('');
                          }
                        }}
                      />
                      {!hasAddresses && isAuthenticated && (
                        <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-4 h-4 rounded accent-primary"
                          />
                          <span className="text-sm text-text-secondary">Lưu địa chỉ này cho lần sau</span>
                        </label>
                      )}
                    </>
                  )}

                  {hasAddresses && !useNewAddress && selectedAddrId && (
                    <div className="bg-bg-raised border border-surface-border rounded-xl p-3 mt-2 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary">{address.fullName} · {address.phone}</p>
                          <p className="text-text-muted text-xs mt-0.5">
                            {[address.street, address.ward, address.district, address.city].filter(Boolean).join(', ')}
                          </p>
                          {!address.city?.trim() && (
                            <p className="text-xs text-amber-500 font-semibold mt-1">⚠ Thiếu Tỉnh/Thành phố — nhấn Chỉnh sửa để bổ sung</p>
                          )}
                        </div>
                        <button type="button" onClick={() => setUseNewAddress(true)} className="text-xs text-primary hover:underline flex-shrink-0 font-semibold">
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    placeholder="Ghi chú (tuỳ chọn)" value={notes} onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full mt-3 px-4 py-3 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none resize-none"
                  />
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-bg-elevated rounded-2xl p-6 border border-surface-border"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-xl font-bold text-text-primary">{t('paymentMethod').toUpperCase()}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button" onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border-2 transition text-left ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-surface-border hover:border-primary/50'}`}
                    >
                      <div className="font-bold text-text-primary mb-1">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-xs text-text-muted">Trả tiền mặt khi shipper giao hàng</div>
                    </button>

                    <button
                      type="button" onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-xl border-2 transition text-left ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-surface-border hover:border-primary/50'}`}
                    >
                      <div className="font-bold text-text-primary mb-1">Thẻ tín dụng</div>
                      <div className="text-xs text-text-muted">Visa / Mastercard (Stripe)</div>
                    </button>
                  </div>

                  {paymentMethod === 'stripe' && (
                    <div className="mt-4 p-4 bg-bg-raised rounded-lg text-sm text-text-muted border border-surface-border flex items-start gap-2">
                      <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Bạn sẽ nhập thông tin thẻ ở bước tiếp theo. Thanh toán được bảo mật bởi Stripe.</span>
                    </div>
                  )}
                </motion.div>

                {/* Submit button lives inside the form */}
              </form>
            )}
          </div>

          {/* RIGHT: Summary — visible in both steps */}
          <aside className="bg-bg-elevated rounded-2xl p-6 h-fit sticky top-24 border border-surface-border">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">
              {t('orderSummary').toUpperCase()} ({items.length})
            </h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-3">
                  <div className="w-14 h-14 bg-bg-raised rounded-lg p-1 flex-shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary line-clamp-1">{item.name}</p>
                    <p className="text-xs text-text-muted">Size {item.size} × {item.quantity}</p>
                    {item.customization && (item.customization.name || item.customization.number) && (
                      <p className="text-[11px] text-blue-400 font-semibold mt-0.5">
                        In: {item.customization.name}{item.customization.number ? ` #${item.customization.number}` : ''}
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon — input in details step; read-only badge in payment step */}
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> {t('promoCode')}
              </p>
              {couponResult ? (
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary text-sm">{couponCode.toUpperCase()}</span>
                    <span className="text-xs text-primary">-{formatCurrency(discount)}</span>
                  </div>
                  {checkoutStep === 'details' && (
                    <button type="button" onClick={() => { setCouponResult(null); setCouponCode(''); }} className="text-text-muted hover:text-red-500 transition">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : checkoutStep === 'details' ? (
                <div className="flex gap-2">
                  <input
                    value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                    placeholder={t('couponPlaceholder')}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-border focus:border-primary focus:outline-none bg-bg-raised text-text-primary"
                  />
                  <button
                    type="button" onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-1"
                  >
                    {couponLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : t('apply')}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-2 py-4 border-y border-surface-border text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">{t('subtotal')}</span>
                <span className="font-bold text-text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{t('shipping')}</span>
                <span className="font-bold text-text-primary">
                  {shipping === 0 ? <span className="text-primary">{t('free')}</span> : formatCurrency(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>{t('discount')}</span>
                  <span className="font-bold">-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4 mb-6">
              <span className="font-bold text-text-primary">{t('total').toUpperCase()}</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>

            {/* Stock warning — shown when one or more items are unavailable */}
            {stockIssues.length > 0 && checkoutStep === 'details' && (
              <div className="mb-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-xs font-bold text-amber-400 mb-1">Một số sản phẩm không đủ hàng:</p>
                <ul className="space-y-0.5">
                  {stockIssues.map((issue, i) => (
                    <li key={i} className="text-xs text-amber-300">{issue.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA — only shown in details step; payment step has its own Pay button */}
            {checkoutStep === 'details' && (
              <button
                type="submit" form="checkout-form"
                disabled={loading || stockIssues.length > 0}
                className="btn-primary hidden lg:flex w-full items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : paymentMethod === 'stripe' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Tiếp tục → Nhập thông tin thẻ
                  </>
                ) : (
                  t('placeOrder').toUpperCase()
                )}
              </button>
            )}

            {shipping > 0 && checkoutStep === 'details' && (
              <p className="text-center text-xs text-text-muted mt-3">
                🚚 Miễn phí vận chuyển cho đơn từ {formatCurrency(500000)}
              </p>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile sticky submit CTA — Rule 16 */}
      {checkoutStep === 'details' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-elevated border-t border-surface-border px-4 pb-4 pt-3">
          <button
            type="submit" form="checkout-form"
            disabled={loading || stockIssues.length > 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : paymentMethod === 'stripe' ? (
              <>
                <Lock className="w-4 h-4" />
                Tiếp tục → Nhập thông tin thẻ
              </>
            ) : (
              t('placeOrder').toUpperCase()
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
