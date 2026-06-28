import { useEffect, lazy, Suspense } from 'react';

const AdminLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 rounded-full border-4 border-surface-border border-t-primary animate-spin" />
  </div>
);
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import AdminProtected from './components/layout/AdminProtected.jsx';
import Home from './pages/Home.jsx';
import ProductListing from './pages/ProductListing.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import OrderPending from './pages/OrderPending.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
import JerseyPrintPage from './pages/JerseyPrintPage.jsx';
import ProductCompare from './pages/ProductCompare.jsx';
import Wishlist from './pages/Wishlist.jsx';
import BrandPage from './pages/BrandPage.jsx';
import CollectionPage from './pages/CollectionPage.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import CompareBar from './components/product/CompareBar.jsx';
// Admin pages — lazy-loaded so shopper bundle excludes admin code (Rule 90)
import AdminLayout from './pages/admin/AdminLayout.jsx';
const Dashboard             = lazy(() => import('./pages/admin/Dashboard.jsx'));
const ProductManagement     = lazy(() => import('./pages/admin/ProductManagement.jsx'));
const OrderManagement       = lazy(() => import('./pages/admin/OrderManagement.jsx'));
const CustomerSegmentation  = lazy(() => import('./pages/admin/CustomerSegmentation.jsx'));
const SiteAssetsManagement  = lazy(() => import('./pages/admin/SiteAssetsManagement.jsx'));
const AdminCategoryManagement = lazy(() => import('./pages/admin/AdminCategoryManagement.jsx'));
const HeroManagement        = lazy(() => import('./pages/admin/HeroManagement.jsx'));
const NewsManagement        = lazy(() => import('./pages/admin/NewsManagement.jsx'));
const ChannelManagement     = lazy(() => import('./pages/admin/ChannelManagement.jsx'));
const AdminChat             = lazy(() => import('./pages/admin/AdminChat.jsx'));
const CollectionManagement  = lazy(() => import('./pages/admin/CollectionManagement.jsx'));
import ChatWidget from './components/ui/ChatWidget.jsx';
import { useAuthStore } from './store/authStore.js';
import { useThemeStore } from './store/themeStore.js';
import { initSocket, disconnectSocket } from './services/socketService.js';

// ── Route-change focus management (Rule 71) ─────────────────────────────────
const RouteChangeFocus = () => {
  const location = useLocation();
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) { main.focus({ preventScroll: true }); }
  }, [location.pathname]);
  return null;
};

// Layout cho route public (có Navbar, Footer, Chat)
const PublicLayout = ({ children }) => (
  <>
    <RouteChangeFocus />
    {/* Skip-to-main link — visible only on keyboard focus (#25) */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg"
    >
      Bỏ qua nội dung chính
    </a>
    <Navbar />
    <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
    <Footer />
    <ChatWidget />
  </>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {isAdminRoute ? (
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminProtected>
                <AdminLayout />
              </AdminProtected>
            }
          >
            <Route index element={<Suspense fallback={<AdminLoadingFallback />}><Dashboard /></Suspense>} />
            <Route path="products" element={<Suspense fallback={<AdminLoadingFallback />}><ProductManagement /></Suspense>} />
            <Route path="orders" element={<Suspense fallback={<AdminLoadingFallback />}><OrderManagement /></Suspense>} />
            <Route path="segmentation" element={<Suspense fallback={<AdminLoadingFallback />}><CustomerSegmentation /></Suspense>} />
            <Route path="site-assets" element={<Suspense fallback={<AdminLoadingFallback />}><SiteAssetsManagement /></Suspense>} />
            <Route path="categories" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCategoryManagement /></Suspense>} />
            <Route path="hero" element={<Suspense fallback={<AdminLoadingFallback />}><HeroManagement /></Suspense>} />
            <Route path="news" element={<Suspense fallback={<AdminLoadingFallback />}><NewsManagement /></Suspense>} />
            <Route path="channel" element={<Suspense fallback={<AdminLoadingFallback />}><ChannelManagement /></Suspense>} />
            <Route path="chat" element={<Suspense fallback={<AdminLoadingFallback />}><AdminChat /></Suspense>} />
            <Route path="collections" element={<Suspense fallback={<AdminLoadingFallback />}><CollectionManagement /></Suspense>} />
          </Route>
        </Routes>
      ) : (
        <PublicLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/order-pending" element={<OrderPending />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/print-order" element={<JerseyPrintPage />} />
            <Route path="/compare" element={<ProductCompare />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/brands/:slug" element={<BrandPage />} />
            <Route path="/collections/:slug" element={<CollectionPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </PublicLayout>
      )}
      <CompareBar />
      <Toaster
        position="top-right"
        toastOptions={{
          ariaProps: { role: 'status', 'aria-live': 'polite' },
          error: { ariaProps: { role: 'alert', 'aria-live': 'assertive' } },
        }}
      />
    </div>
  );
}

function App() {
  const checkAuth      = useAuthStore((s) => s.checkAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dark           = useThemeStore((s) => s.dark);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) initSocket();
    else disconnectSocket();
  }, [isAuthenticated]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;