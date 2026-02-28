import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Close mobile drawer on route change
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#dfe7ff]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar / Drawer */}
   <aside
  className={[
    "fixed inset-y-0 left-0 z-50 w-72 text-white transform transition-transform duration-300 ease-out",
    sidebarOpen ? "translate-x-0" : "-translate-x-full",
    "md:static md:z-auto md:w-64 md:translate-x-0 md:transition-none",
  ].join(" ")}
>
  {/* Navy Gradient Background */}
<div className="h-full sidebar-gradient
  shadow-2xl border-r border-white/10 flex flex-col">
    {/* Header */}
    <div className="p-5 border-b border-white/10 sidebar-header">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-wide">
            Reminder System
          </h1>
          <p className="text-xs text-blue-200/80 break-all mt-1">
            {user.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="md:hidden rounded-md px-2 py-1 text-gray-300 hover:bg-white/10 transition"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>
    </div>

    {/* Navigation */}
    <nav className="py-4 space-y-1 px-3">

      {[
        { to: "/dashboard", label: "Dashboard" },
        { to: "/employees", label: "Employees" },
        { to: "/bulk-upload", label: "Bulk Upload" },
        { to: "/events", label: "Event Config" },
        { to: "/templates", label: "Templates" },
        { to: "/reports", label: "Reports" },
        { to: "/settings", label: "Settings" },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
       className={`
  nav-item
  group flex items-center rounded-xl px-4 py-2.5 text-sm font-medium
  ${isActive(item.to) ? "nav-active" : "text-slate-300"}
`}
        >
          <span className="truncate">{item.label}</span>
        </Link>
      ))}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 flex items-center rounded-xl px-4 py-2.5 text-sm font-medium
          text-red-300 hover:text-white hover:bg-red-500/20 transition-all"
      >
        Logout
      </button>
    </nav>

  </div>
</aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-gray-100 border-b border-gray-200">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-md bg-gray-800 text-white px-3 py-2 hover:bg-gray-700"
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">Reminder System</div>
              <div className="text-xs text-gray-600 truncate">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
