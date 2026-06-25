import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const showCartToast = (addedLabel) =>
  toast(
    (ref) => (
      <span className="flex items-center gap-3 text-sm">
        <span>{addedLabel}</span>
        <Link
          to="/cart"
          onClick={() => toast.dismiss(ref.id)}
          className="text-primary font-bold hover:underline flex-shrink-0"
        >
          Đi đến giỏ hàng →
        </Link>
      </span>
    ),
    { duration: 3000 },
  );
