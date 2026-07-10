// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/register';
import AllAssetsPage from './pages/assets/AllAssetsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// ◄— Add this import line right here to fix the red underline!
import { ProtectedRoute, RoleGuard } from './components/auth/Guards'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Regular User Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/assets/all" element={<AllAssetsPage />} />
        </Route>

        {/* Strict Admin Only Protected Routes */}
        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;