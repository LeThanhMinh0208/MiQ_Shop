import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="font-display text-xl font-bold text-text-primary mb-3">{title}</h2>
    <div className="text-sm text-text-secondary leading-relaxed space-y-2">{children}</div>
  </section>
);

const Terms = () => (
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
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Điều Khoản Sử Dụng</h1>
          <p className="text-xs text-text-muted mt-0.5">Cập nhật lần cuối: tháng 6/2026</p>
        </div>
      </div>

      {/* CONTENT GAP — awaiting legal review */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 mb-8 text-sm text-amber-400 font-semibold">
        Nội dung điều khoản đang được cập nhật và sẽ có hiệu lực trước khi website ra mắt chính thức.
        Vui lòng liên hệ <a href="mailto:support@miqsport.vn" className="underline">support@miqsport.vn</a> nếu bạn có câu hỏi.
      </div>

      <div className="bg-bg-elevated border border-surface-border rounded-2xl p-8 space-y-0">
        <Section title="1. Chấp Nhận Điều Khoản">
          <p>Khi sử dụng website MiQ Sport, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ.</p>
        </Section>

        <Section title="2. Tài Khoản Người Dùng">
          <p>Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. MiQ Sport không chịu trách nhiệm với bất kỳ tổn thất nào phát sinh từ việc tài khoản bị truy cập trái phép do lỗi của bạn.</p>
          <p>Bạn đồng ý cung cấp thông tin chính xác và cập nhật thông tin khi có thay đổi.</p>
        </Section>

        <Section title="3. Đặt Hàng & Thanh Toán">
          <p>MiQ Sport có quyền từ chối hoặc hủy bỏ đơn hàng trong trường hợp phát hiện gian lận, lỗi về giá hoặc tình trạng hàng tồn kho.</p>
          <p>Giá sản phẩm đã bao gồm VAT. Phí vận chuyển được tính riêng và hiển thị rõ trước khi đặt hàng.</p>
        </Section>

        <Section title="4. Chính Sách Đổi Trả">
          <p>Sản phẩm đủ điều kiện đổi trả trong vòng 30 ngày kể từ ngày nhận hàng nếu còn nguyên tag, chưa qua sử dụng. Vui lòng xem chi tiết tại trang Chính Sách Đổi Trả.</p>
        </Section>

        <Section title="5. Sở Hữu Trí Tuệ">
          <p>Toàn bộ nội dung, hình ảnh, logo và thiết kế trên website MiQ Sport là tài sản của MiQ Sport hoặc các đối tác được cấp phép. Nghiêm cấm sao chép, phân phối mà không có sự cho phép bằng văn bản.</p>
        </Section>

        <Section title="6. Giới Hạn Trách Nhiệm">
          <p>MiQ Sport không chịu trách nhiệm với các thiệt hại gián tiếp, đặc biệt hoặc hậu quả phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.</p>
        </Section>

        <Section title="7. Liên Hệ">
          <p>Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Email: <a href="mailto:support@miqsport.vn" className="text-primary hover:underline">support@miqsport.vn</a></li>
            <li>Hotline: 1800 xxxx (miễn phí, 8:00–22:00)</li>
            <li>Địa chỉ: Tầng X, Tòa nhà Y, TP. Hồ Chí Minh</li>
          </ul>
        </Section>
      </div>

      <p className="text-center text-xs text-text-muted mt-8">
        <Link to="/privacy" className="text-primary hover:underline">Chính Sách Bảo Mật</Link>
        {' · '}
        <Link to="/" className="hover:text-primary transition">Trang chủ MiQ Sport</Link>
      </p>
    </div>
  </div>
);

export default Terms;
