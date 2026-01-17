import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Close mobile drawer on route change
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-100">
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
          'fixed inset-y-0 left-0 z-50 w-72 bg-gray-800 text-white transform transition-transform duration-200 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static md:z-auto md:w-64 md:translate-x-0 md:transition-none'
        ].join(' ')}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight">Reminder System</h1>
              <p className="text-sm text-gray-400 break-all">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden inline-flex items-center justify-center rounded-md px-2 py-1 text-gray-200 hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>
        <nav className="py-2">
          <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-700">
            Dashboard
          </Link>
          <Link to="/employees" className="block px-4 py-2 hover:bg-gray-700">
            Employees
          </Link>
          <Link to="/bulk-upload" className="block px-4 py-2 hover:bg-gray-700">
            Bulk Upload
          </Link>
          <Link to="/events" className="block px-4 py-2 hover:bg-gray-700">
            Event Config
          </Link>
          <Link to="/templates" className="block px-4 py-2 hover:bg-gray-700">
            Templates
          </Link>
          <Link to="/reports" className="block px-4 py-2 hover:bg-gray-700">
            Reports
          </Link>
          <Link to="/settings" className="block px-4 py-2 hover:bg-gray-700">
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700"
          >
            Logout
          </button>
        </nav>
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
