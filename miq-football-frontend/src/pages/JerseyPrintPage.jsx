import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, ChevronLeft, Loader, Check, Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPrintOrder } from '../services/printOrderService.js';

const JERSEY_TYPES = [
  { value: 'sublimation', label: 'Sublimation (In nhiệt toàn thân)', price: 200000 },
  { value: 'heat_press',  label: 'Heat Press (In chuyển nhiệt)',      price: 150000 },
  { value: 'embroidery',  label: 'Thêu logo & tên',                   price: 250000 },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const newPlayer = () => ({ playerName: '', jerseyNumber: '', size: 'M' });

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const JerseyPrintPage = () => {
  const navigate = useNavigate();

  const [jerseyType, setJerseyType]   = useState('sublimation');
  const [teamName, setTeamName]       = useState('');
  const [players, setPlayers]         = useState([newPlayer()]);
  const [contactName, setContactName] = useState('');
  const [phone, setPhone]             = useState('');
  const [email, setEmail]             = useState('');
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const unitPrice  = JERSEY_TYPES.find((j) => j.value === jerseyType)?.price ?? 200000;
  const totalPrice = players.length * unitPrice;

  const addPlayer = () => setPlayers((p) => [...p, newPlayer()]);

  const removePlayer = (i) => {
    if (players.length <= 1) return;
    setPlayers((p) => p.filter((_, idx) => idx !== i));
  };

  const updatePlayer = (i, field, val) =>
    setPlayers((p) => p.map((pl, idx) => (idx === i ? { ...pl, [field]: val } : pl)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim()) { toast.error('Vui lòng nhập tên liên hệ'); return; }
    if (!phone.trim())       { toast.error('Vui lòng nhập số điện thoại'); return; }
    const invalid = players.some((p) => !p.playerName.trim() || !p.jerseyNumber.trim());
    if (invalid) { toast.error('Vui lòng điền đủ tên và số áo cho tất cả cầu thủ'); return; }

    setLoading(true);
    try {
      await createPrintOrder({
        contactName: contactName.trim(),
        phone:       phone.trim(),
        email:       email.trim(),
        teamName:    teamName.trim(),
        jerseyType,
        players,
        notes:       notes.trim(),
        // totalPrice intentionally omitted — server recomputes from players.length × unitPrice
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-raised flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-bg-elevated rounded-3xl border border-surface-border p-10 max-w-md w-full text-center shadow-depth-lg"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-3">ĐẶT IN THÀNH CÔNG!</h2>
          <p className="text-text-muted mb-2">Cảm ơn bạn đã đặt in áo đội với MiQ Sport.</p>
          <p className="text-text-muted mb-6 text-sm">Chúng tôi sẽ liên hệ xác nhận trong vòng 24h.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="btn-outline flex-1">Về trang chủ</button>
            <button
              onClick={() => {
                setSubmitted(false);
                setPlayers([newPlayer()]);
                setContactName('');
                setPhone('');
                setEmail('');
                setTeamName('');
                setNotes('');
              }}
              className="btn-primary flex-1"
            >
              Đặt thêm
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-raised py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition mb-4 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-primary" />
            </div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Dịch Vụ In Ấn</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary">IN ĐẶT THEO ĐỘI</h1>
          <p className="text-text-muted mt-2">Điền thông tin bên dưới, chúng tôi sẽ liên hệ xác nhận trong vòng 24h.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Jersey type */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-4">Loại in ấn</h3>
            <div className="flex flex-col gap-2">
              {JERSEY_TYPES.map((jt) => (
                <label
                  key={jt.value}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition ${
                    jerseyType === jt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-surface-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="jerseyType"
                      value={jt.value}
                      checked={jerseyType === jt.value}
                      onChange={() => setJerseyType(jt.value)}
                      className="accent-primary"
                    />
                    <span className={`font-semibold text-sm ${jerseyType === jt.value ? 'text-primary' : 'text-text-primary'}`}>
                      {jt.label}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-primary">{fmt(jt.price)}/áo</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Team name */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-4">Thông tin đội</h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">
                Tên đội bóng <span className="text-text-muted font-normal normal-case">(không bắt buộc)</span>
              </label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="VD: FC Rồng Vàng"
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </motion.div>

          {/* Player list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg">Danh sách cầu thủ</h3>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {players.length} người
                </span>
              </div>
              <button
                type="button"
                onClick={addPlayer}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_90px_80px_36px] gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Tên in trên áo</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Số áo</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Cỡ</span>
                <span />
              </div>

              {players.map((pl, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_80px_36px] gap-2 items-center">
                  <input
                    required
                    value={pl.playerName}
                    onChange={(e) => updatePlayer(i, 'playerName', e.target.value.toUpperCase())}
                    placeholder={`NGUYEN VAN ${String.fromCharCode(65 + (i % 26))}`}
                    className="px-3 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold tracking-wide text-sm"
                  />
                  <input
                    required
                    type="number"
                    min="1"
                    max="99"
                    value={pl.jerseyNumber}
                    onChange={(e) => updatePlayer(i, 'jerseyNumber', e.target.value)}
                    placeholder="10"
                    className="px-3 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-center text-sm"
                  />
                  <select
                    value={pl.size}
                    onChange={(e) => updatePlayer(i, 'size', e.target.value)}
                    className="px-2 py-2.5 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none text-sm font-semibold cursor-pointer"
                  >
                    {SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removePlayer(i)}
                    disabled={players.length <= 1}
                    title={players.length <= 1 ? 'Cần ít nhất 1 cầu thủ' : 'Xóa'}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-surface-border text-text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted disabled:hover:border-surface-border"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addPlayer}
              className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-surface-border text-text-muted hover:border-primary/40 hover:text-primary transition text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm cầu thủ
            </button>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-bg-elevated rounded-2xl border border-surface-border p-6 space-y-4"
          >
            <h3 className="font-display font-bold text-lg">Thông tin liên hệ</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0900 000 000"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">
                Email <span className="text-text-muted font-normal normal-case">(không bắt buộc)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@email.com"
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-1.5">Ghi chú</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Yêu cầu đặc biệt về màu sắc, font chữ, logo..."
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </motion.div>

          {/* Price summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Tổng dự tính</p>
              <p className="text-text-muted text-sm">
                {players.length} áo × {fmt(unitPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-black text-primary">{fmt(totalPrice)}</p>
              <p className="text-xs text-text-muted mt-0.5">Giá cuối sẽ xác nhận qua điện thoại</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-4 !text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
            {loading ? 'Đang gửi...' : 'Đặt In Ngay'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JerseyPrintPage;
