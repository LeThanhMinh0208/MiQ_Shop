import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';

const AdminLayout = () => {
  return (
    <div className="flex bg-cream min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;