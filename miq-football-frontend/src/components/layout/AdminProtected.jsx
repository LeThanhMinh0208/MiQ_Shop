import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Loader } from 'lucide-react';

const AdminProtected = ({ children }) => {
  const { user, checkAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Đợi checkAuth xong rồi mới quyết định redirect hay không
    const verify = async () => {
      await checkAuth();
      setChecking(false);
    };
    verify();
  }, []);

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Login rồi nhưng không phải admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold mb-2">403 - Không có quyền</h2>
          <p className="text-text-muted">Chỉ Admin mới truy cập được trang này</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtected;