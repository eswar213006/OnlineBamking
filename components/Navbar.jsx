import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Landmark, LogOut, User } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-bank-blue text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
                        <Landmark size={24} />
                        <span>Online Banking</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.role === 'customer' && (
                                    <>
                                        <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-bank-hover transition">Dashboard</Link>
                                        <Link to="/loans" className="px-3 py-2 rounded-md hover:bg-bank-hover transition">Loans</Link>
                                        <Link to="/profile" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-bank-hover transition">
                                            <User size={18} />
                                            <span>Profile</span>
                                        </Link>
                                    </>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-bank-hover transition">Admin Dashboard</Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 rounded-md hover:bg-bank-hover transition">Login</Link>
                                <Link to="/register" className="bg-white text-bank-blue px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
