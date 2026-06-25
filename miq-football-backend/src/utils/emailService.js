import nodemailer from 'nodemailer';

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
    return nodemailer.createTransporter({
        host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
        port:   Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false },
    });
};

// Escape every user-controlled value before interpolating into HTML.
// & must be first so we don't double-escape entities we insert ourselves.
const escapeHtml = (str) =>
    String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

const STATUS_VI = {
    pending:   { label: 'Chờ xác nhận',    color: '#F59E0B', icon: '⏳' },
    confirmed: { label: 'Đã xác nhận',     color: '#3B82F6', icon: '✅' },
    shipping:  { label: 'Đang vận chuyển', color: '#8B5CF6', icon: '🚚' },
    delivered: { label: 'Đã giao hàng',   color: '#10B981', icon: '📦' },
    cancelled: { label: 'Đã hủy',         color: '#EF4444', icon: '❌' },
};

const formatCurrency = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MiQ Sport</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a1a12 0%,#000 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;border-bottom:2px solid #10B981;">
            <div style="font-size:32px;font-weight:900;letter-spacing:4px;color:#fff;margin-bottom:4px;">
              M<span style="color:#10B981;">i</span><span style="color:#10B981;text-shadow:0 0 20px rgba(16,185,129,0.8);">Q</span>
              <span style="font-size:11px;font-weight:700;letter-spacing:8px;color:rgba(255,255,255,0.4);vertical-align:middle;margin-left:8px;">SPORT</span>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;letter-spacing:2px;text-transform:uppercase;">Thiên Đường Bóng Đá</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#111113;padding:32px;border-left:1px solid #1f1f23;border-right:1px solid #1f1f23;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0a0a0c;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border:1px solid #1f1f23;border-top:none;">
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">
              © 2025 MiQ Sport · Mọi thắc mắc liên hệ <a href="mailto:support@miqsport.vn" style="color:#10B981;">support@miqsport.vn</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Order confirmation email ───────────────────────────────────────────────
export const sendOrderConfirmation = async (order, user) => {
    const transporter = createTransporter();
    if (!transporter) return;

    const shortId = order._id.toString().slice(-8).toUpperCase();
    const itemRows = order.items.map((item) => {
        const customLine = (item.customization?.name || item.customization?.number)
            ? `<br/><span style="color:#60a5fa;font-size:11px;">In: ${escapeHtml(item.customization.name)}${item.customization.number ? ` #${escapeHtml(item.customization.number)}` : ''}</span>`
            : '';
        return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1f1f23;">
            <span style="color:#e5e7eb;font-size:14px;">${escapeHtml(item.name)}</span>
            <span style="color:#6b7280;font-size:12px;"> · Size ${escapeHtml(item.size)} × ${item.quantity}</span>
            ${customLine}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1f1f23;text-align:right;color:#10B981;font-weight:bold;font-size:14px;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>`;
    }).join('');

    const addr = order.shippingAddress;
    const addrLine = [addr.street, addr.ward, addr.district, addr.city]
        .filter(Boolean)
        .map(escapeHtml)
        .join(', ');

    const html = baseTemplate(`
        <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Đơn hàng đã được đặt thành công! 🎉</h2>
        <p style="color:#9ca3af;margin:0 0 24px;">Xin chào <strong style="color:#e5e7eb;">${escapeHtml(user.name)}</strong>, cảm ơn bạn đã đặt hàng tại MiQ Sport.</p>

        <div style="background:#0d0d0f;border:1px solid #1f1f23;border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="color:#10B981;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Mã đơn hàng</p>
          <p style="color:#fff;font-size:22px;font-weight:900;letter-spacing:4px;margin:0;">#${shortId}</p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          ${itemRows}
          <tr>
            <td style="padding:12px 0 4px;color:#6b7280;font-size:13px;">Tạm tính</td>
            <td style="padding:12px 0 4px;text-align:right;color:#e5e7eb;font-size:13px;">${formatCurrency(order.itemsPrice)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:13px;">Phí vận chuyển</td>
            <td style="padding:4px 0;text-align:right;color:#e5e7eb;font-size:13px;">${order.shippingPrice === 0 ? 'Miễn phí' : formatCurrency(order.shippingPrice)}</td>
          </tr>
          ${order.coupon?.discount > 0 ? `<tr><td style="padding:4px 0;color:#10B981;font-size:13px;">Giảm giá</td><td style="padding:4px 0;text-align:right;color:#10B981;font-size:13px;">-${formatCurrency(order.coupon.discount)}</td></tr>` : ''}
          <tr>
            <td style="padding:12px 0 0;color:#fff;font-size:16px;font-weight:bold;border-top:1px solid #1f1f23;">Tổng cộng</td>
            <td style="padding:12px 0 0;text-align:right;color:#10B981;font-size:20px;font-weight:900;border-top:1px solid #1f1f23;">${formatCurrency(order.totalPrice)}</td>
          </tr>
        </table>

        <div style="background:#0d0d0f;border:1px solid #1f1f23;border-radius:12px;padding:16px;margin-bottom:20px;">
          <p style="color:#10B981;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Địa chỉ giao hàng</p>
          <p style="color:#e5e7eb;margin:0;line-height:1.6;">
            ${escapeHtml(addr.fullName)}<br/>
            📞 ${escapeHtml(addr.phone)}<br/>
            📍 ${addrLine}
          </p>
        </div>

        <p style="color:#9ca3af;font-size:13px;margin:0;">Phương thức thanh toán: <strong style="color:#e5e7eb;">${order.payment.method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thẻ tín dụng / Stripe'}</strong></p>
    `);

    await transporter.sendMail({
        from: `"MiQ Sport" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `✅ Đặt hàng thành công #${shortId} — MiQ Sport`,
        html,
    }).catch((e) => console.error('[Email] sendOrderConfirmation:', e.message));
};

// ── Password reset email ──────────────────────────────────────────────────
export const sendPasswordResetEmail = async (user, resetUrl) => {
    const transporter = createTransporter();
    if (!transporter) return;

    const html = baseTemplate(`
        <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">🔐 Đặt lại mật khẩu</h2>
        <p style="color:#9ca3af;margin:0 0 24px;">Xin chào <strong style="color:#e5e7eb;">${escapeHtml(user.name)}</strong>,</p>
        <p style="color:#9ca3af;margin:0 0 16px;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để tiếp tục.
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a
            href="${escapeHtml(resetUrl)}"
            style="display:inline-block;background:#10B981;color:#fff;font-weight:700;font-size:15px;padding:14px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;"
          >
            Đặt lại mật khẩu
          </a>
        </div>

        <div style="background:#0d0d0f;border:1px solid #1f1f23;border-radius:12px;padding:16px;margin-bottom:20px;">
          <p style="color:#f59e0b;font-size:12px;font-weight:700;margin:0 0 6px;">⚠️ Lưu ý quan trọng</p>
          <ul style="color:#9ca3af;font-size:12px;margin:0;padding-left:18px;line-height:2;">
            <li>Liên kết này chỉ có hiệu lực trong <strong style="color:#e5e7eb;">15 phút</strong>.</li>
            <li>Liên kết chỉ dùng được <strong style="color:#e5e7eb;">một lần</strong> duy nhất.</li>
            <li>Nếu bạn không yêu cầu đặt lại, hãy bỏ qua email này.</li>
          </ul>
        </div>

        <p style="color:#6b7280;font-size:12px;margin:0;">
          Nếu nút không hoạt động, copy và dán đường dẫn sau vào trình duyệt:<br/>
          <span style="color:#10B981;word-break:break-all;">${escapeHtml(resetUrl)}</span>
        </p>
    `);

    await transporter.sendMail({
        from: `"MiQ Sport" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔐 Đặt lại mật khẩu — MiQ Sport',
        html,
    }).catch((e) => console.error('[Email] sendPasswordResetEmail:', e.message));
};

// ── Order status update email ─────────────────────────────────────────────
export const sendOrderStatusUpdate = async (order, user, note = '') => {
    const transporter = createTransporter();
    if (!transporter) return;

    const shortId = order._id.toString().slice(-8).toUpperCase();
    const st = STATUS_VI[order.status] || { label: order.status, color: '#9ca3af', icon: '📋' };

    const html = baseTemplate(`
        <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">${st.icon} Cập nhật đơn hàng #${shortId}</h2>
        <p style="color:#9ca3af;margin:0 0 24px;">Xin chào <strong style="color:#e5e7eb;">${escapeHtml(user.name)}</strong>, đơn hàng của bạn vừa được cập nhật trạng thái.</p>

        <div style="background:#0d0d0f;border:2px solid ${st.color};border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Trạng thái mới</p>
          <p style="color:${st.color};font-size:24px;font-weight:900;margin:0;text-shadow:0 0 20px ${st.color}55;">${st.label}</p>
          ${note ? `<p style="color:#9ca3af;font-size:13px;margin:12px 0 0;">${escapeHtml(note)}</p>` : ''}
        </div>

        ${order.status === 'shipping' ? `
        <div style="background:#0d0d0f;border:1px solid #1f1f23;border-radius:12px;padding:16px;margin-bottom:20px;">
          <p style="color:#8B5CF6;font-size:13px;font-weight:bold;margin:0 0 4px;">🚚 Đơn hàng đang trên đường giao đến bạn!</p>
          <p style="color:#9ca3af;font-size:12px;margin:0;">Dự kiến giao hàng trong 1-3 ngày làm việc. Vui lòng để ý điện thoại từ shipper.</p>
        </div>` : ''}

        ${order.status === 'delivered' ? `
        <div style="background:#0d0d0f;border:1px solid #10B981;border-radius:12px;padding:16px;margin-bottom:20px;">
          <p style="color:#10B981;font-size:13px;font-weight:bold;margin:0 0 4px;">🌟 Đơn hàng đã được giao thành công!</p>
          <p style="color:#9ca3af;font-size:12px;margin:0;">Cảm ơn bạn đã mua hàng tại MiQ Sport. Hãy để lại đánh giá để giúp chúng tôi phục vụ tốt hơn!</p>
        </div>` : ''}

        <p style="color:#6b7280;font-size:12px;margin:0;">Mã đơn hàng: <strong style="color:#fff;letter-spacing:2px;">#${shortId}</strong> · Đặt lúc: ${new Date(order.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
    `);

    await transporter.sendMail({
        from: `"MiQ Sport" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `${st.icon} Đơn #${shortId} — ${st.label} — MiQ Sport`,
        html,
    }).catch((e) => console.error('[Email] sendOrderStatusUpdate:', e.message));
};
