import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import BulkUpload from './pages/BulkUpload';
import EventConfiguration from './pages/EventConfiguration';
import TemplateEditor from './pages/TemplateEditor';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="bulk-upload" element={<BulkUpload />} />
            <Route path="events" element={<EventConfiguration />} />
            <Route path="templates" element={<TemplateEditor />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
