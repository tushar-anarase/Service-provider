import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerRequests from './pages/customer/MyRequests';
import CreateRequest from './pages/customer/CreateRequest';
import RequestDetail from './pages/customer/RequestDetail';
import CustomerProfile from './pages/customer/Profile';
import CustomerPayments from './pages/customer/Payments';

// Provider
import ProviderDashboard from './pages/provider/Dashboard';
import AvailableJobs from './pages/provider/AvailableJobs';
import ProviderJobs from './pages/provider/MyJobs';
import ProviderProfile from './pages/provider/Profile';
import ProviderEarnings from './pages/provider/Earnings';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminServices from './pages/admin/Services';
import AdminRequests from './pages/admin/Requests';
import AdminComplaints from './pages/admin/Complaints';
import AdminPayments from './pages/admin/Payments';

// Components
import AppLayout from './components/AppLayout';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="loader" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/provider" replace />;
    return <Navigate to="/customer" replace />;
  }
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="loader" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'provider') return <Navigate to="/provider" replace />;
  return <Navigate to="/customer" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<RoleRedirect />} />

              {/* Customer Routes */}
              <Route path="/customer" element={<ProtectedRoute role="customer"><AppLayout /></ProtectedRoute>}>
                <Route index element={<CustomerDashboard />} />
                <Route path="requests" element={<CustomerRequests />} />
                <Route path="requests/new" element={<CreateRequest />} />
                <Route path="requests/:id" element={<RequestDetail />} />
                <Route path="payments" element={<CustomerPayments />} />
                <Route path="profile" element={<CustomerProfile />} />
              </Route>

              {/* Provider Routes */}
              <Route path="/provider" element={<ProtectedRoute role="provider"><AppLayout /></ProtectedRoute>}>
                <Route index element={<ProviderDashboard />} />
                <Route path="jobs/available" element={<AvailableJobs />} />
                <Route path="jobs" element={<ProviderJobs />} />
                <Route path="jobs/:id" element={<RequestDetail />} />
                <Route path="earnings" element={<ProviderEarnings />} />
                <Route path="profile" element={<ProviderProfile />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="payments" element={<AdminPayments />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
