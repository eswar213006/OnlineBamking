import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import TransferPage from './pages/TransferPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import LoanPage from './pages/LoanPage';
import ProfilePage from './pages/ProfilePage';
import BeneficiaryPage from './pages/BeneficiaryPage';
import FDPage from './pages/FDPage';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = React.useContext(AuthContext);
    
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    if (role && user.role !== role) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
    }
    
    return children;
};

function AppRoutes() {
    const { user } = React.useContext(AuthContext);
    return (
        <div className="min-h-screen flex text-gray-100">
            {user && <Sidebar />}
            <div className={`flex-grow flex flex-col transition-all duration-300 ${user ? 'ml-64' : ''}`}>
                {!user && <Navbar />}
                <main className={`flex-grow ${!user ? 'container mx-auto px-4 py-8' : 'p-10'} animate-fade-in`}>
                    <Routes>
                        <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LandingPage />} />
                        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LoginPage />} />
                        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
                        
                        {/* Customer Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
                        <Route path="/deposit" element={<ProtectedRoute role="customer"><DepositPage /></ProtectedRoute>} />
                        <Route path="/withdraw" element={<ProtectedRoute role="customer"><WithdrawPage /></ProtectedRoute>} />
                        <Route path="/transfer" element={<ProtectedRoute role="customer"><TransferPage /></ProtectedRoute>} />
                        <Route path="/beneficiaries" element={<ProtectedRoute role="customer"><BeneficiaryPage /></ProtectedRoute>} />
                        <Route path="/fd" element={<ProtectedRoute role="customer"><FDPage /></ProtectedRoute>} />
                        <Route path="/history/:account_no" element={<ProtectedRoute role="customer"><TransactionHistoryPage /></ProtectedRoute>} />
                        <Route path="/loans" element={<ProtectedRoute role="customer"><LoanPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute role="customer"><ProfilePage /></ProtectedRoute>} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
