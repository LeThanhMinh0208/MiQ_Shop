import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';

const getInitialCollapsed = () => {
  try { return localStorage.getItem('miq-admin-sidebar') === '1'; }
  catch { return false; }
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const onToggle = () => setCollapsed((c) => {
    const next = !c;
    try { localStorage.setItem('miq-admin-sidebar', next ? '1' : '0'); } catch {}
    return next;
  });

  return (
    <div className="flex bg-bg-base min-h-screen">
      <AdminSidebar collapsed={collapsed} onToggle={onToggle} />
      <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
