import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AppShell from './components/layout/AppShell';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MedicineList from './pages/Medicines/MedicineList';
import MedicineForm from './pages/Medicines/MedicineForm';
import MedicineDetail from './pages/Medicines/MedicineDetail';
import BatchList from './pages/Batches/BatchList';
import BatchForm from './pages/Batches/BatchForm';
import BatchDetail from './pages/Batches/BatchDetail';
import ExpiryDashboard from './pages/Expiry/ExpiryDashboard';
import OrderList from './pages/Orders/OrderList';
import OrderForm from './pages/Orders/OrderForm';
import ReportsPage from './pages/Reports/ReportsPage';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import SupplierList from './pages/Suppliers/SupplierList';

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/medicines" element={<MedicineList />} />
              <Route path="/medicines/new" element={<MedicineForm />} />
              <Route path="/medicines/:id" element={<MedicineDetail />} />
              <Route path="/medicines/:id/edit" element={<MedicineForm />} />
              <Route path="/batches" element={<BatchList />} />
              <Route path="/batches/new" element={<BatchForm />} />
              <Route path="/batches/:id" element={<BatchDetail />} />
              <Route path="/expiry" element={<ExpiryDashboard />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/orders/new" element={<OrderForm />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/suppliers" element={<SupplierList />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
