import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="font-display text-xl font-bold text-text-primary mb-3">{title}</h2>
    <div className="text-sm text-text-secondary leading-relaxed space-y-2">{children}</div>
  </section>
);

const Privacy = () => (
  <div className="min-h-screen bg-bg-base py-12 px-6">
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Trang chủ
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Chính Sách Bảo Mật</h1>
          <p className="text-xs text-text-muted mt-0.5">Cập nhật lần cuối: tháng 6/2026</p>
        </div>
      </div>

      {/* CONTENT GAP — awaiting legal review */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 mb-8 text-sm text-amber-400 font-semibold">
        Nội dung chính sách bảo mật đang được hoàn thiện và sẽ có hiệu lực trước khi website ra mắt chính thức.
        Vui lòng liên hệ <a href="mailto:privacy@miqsport.vn" className="underline">privacy@miqsport.vn</a> nếu bạn có câu hỏi về dữ liệu cá nhân.
      </div>

      <div className="bg-bg-elevated border border-surface-border rounded-2xl p-8 space-y-0">
        <Section title="1. Thông Tin Chúng Tôi Thu Thập">
          <p>Khi bạn sử dụng MiQ Sport, chúng tôi có thể thu thập các loại thông tin sau:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, mật khẩu (được mã hóa)</li>
            <li><strong>Thông tin giao hàng:</strong> Địa chỉ, số điện thoại</li>
            <li><strong>Thông tin giao dịch:</strong> Lịch sử đặt hàng, phương thức thanh toán (chỉ lưu loại thẻ — không lưu số thẻ)</li>
            <li><strong>Dữ liệu sử dụng:</strong> Trang đã xem, tìm kiếm, thiết bị và trình duyệt</li>
          </ul>
        </Section>

        <Section title="2. Cách Chúng Tôi Sử Dụng Thông Tin">
          <ul className="list-disc list-inside space-y-1">
            <li>Xử lý và giao đơn hàng của bạn</li>
            <li>Gửi thông báo đơn hàng và cập nhật trạng thái giao hàng</li>
            <li>Cải thiện trải nghiệm mua sắm và gợi ý sản phẩm phù hợp</li>
            <li>Ngăn chặn gian lận và bảo vệ bảo mật tài khoản</li>
            <li>Tuân thủ nghĩa vụ pháp lý</li>
          </ul>
        </Section>

        <Section title="3. Chia Sẻ Thông Tin">
          <p>MiQ Sport không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin với:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Đối tác vận chuyển:</strong> Để giao hàng (tên, địa chỉ, số điện thoại)</li>
            <li><strong>Stripe:</strong> Xử lý thanh toán bảo mật (số thẻ không lưu trên server MiQ)</li>
            <li><strong>Cloudinary:</strong> Lưu trữ ảnh đại diện và ảnh sản phẩm</li>
            <li><strong>Cơ quan nhà nước:</strong> Khi có yêu cầu pháp lý bắt buộc</li>
          </ul>
        </Section>

        <Section title="4. Bảo Mật Dữ Liệu">
          <p>Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Mật khẩu được mã hóa bằng bcrypt (không lưu dạng plain text)</li>
            <li>JWT được lưu trong httpOnly cookie, không thể đọc bởi JavaScript</li>
            <li>CSRF protection trên tất cả các endpoint thay đổi dữ liệu</li>
            <li>Kết nối HTTPS (TLS) toàn bộ website</li>
          </ul>
        </Section>

        <Section title="5. Quyền Của Bạn">
          <p>Bạn có quyền:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Truy cập và chỉnh sửa thông tin cá nhân trong trang Hồ Sơ</li>
            <li>Yêu cầu xóa tài khoản và dữ liệu liên quan</li>
            <li>Từ chối nhận email tiếp thị (qua nút Hủy đăng ký trong email)</li>
            <li>Yêu cầu sao chép dữ liệu cá nhân của bạn</li>
          </ul>
          <p className="mt-2">Để thực hiện các quyền trên, vui lòng liên hệ <a href="mailto:privacy@miqsport.vn" className="text-primary hover:underline">privacy@miqsport.vn</a>.</p>
        </Section>

        <Section title="6. Cookie">
          <p>Website sử dụng cookie để duy trì phiên đăng nhập (httpOnly, SameSite=Strict) và token CSRF. Chúng tôi không sử dụng cookie theo dõi bên thứ ba hay quảng cáo.</p>
        </Section>

        <Section title="7. Thay Đổi Chính Sách">
          <p>Chúng tôi có thể cập nhật chính sách bảo mật theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email hoặc hiển thị thông báo nổi bật trên website.</p>
        </Section>

        <Section title="8. Liên Hệ">
          <ul className="list-disc list-inside space-y-1">
            <li>Email: <a href="mailto:privacy@miqsport.vn" className="text-primary hover:underline">privacy@miqsport.vn</a></li>
            <li>Hotline: 1800 xxxx (miễn phí, 8:00–22:00)</li>
          </ul>
        </Section>
      </div>

      <p className="text-center text-xs text-text-muted mt-8">
        <Link to="/terms" className="text-primary hover:underline">Điều Khoản Sử Dụng</Link>
        {' · '}
        <Link to="/" className="hover:text-primary transition">Trang chủ MiQ Sport</Link>
      </p>
    </div>
  </div>
);

export default Privacy;
