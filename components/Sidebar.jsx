import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    ArrowRightLeft,
    PlusCircle,
    MinusCircle,
    History,
    CreditCard,
    User,
    LogOut,
    Landmark,
    ShieldCheck,
    Zap,
    TrendingUp
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = user?.role === 'customer' ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Transfer', path: '/transfer', icon: ArrowRightLeft },
        { name: 'Payees', path: '/beneficiaries', icon: User },
        { name: 'Fixed Protocols', path: '/fd', icon: TrendingUp },
        { name: 'Deposit', path: '/deposit', icon: PlusCircle },
        { name: 'Withdraw', path: '/withdraw', icon: MinusCircle },
        { name: 'Loans', path: '/loans', icon: CreditCard },
        { name: 'Profile', path: '/profile', icon: ShieldCheck },
    ] : [
        { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
    ];

    return (
        <aside className="w-64 glass-sidebar min-h-screen fixed left-0 top-0 flex flex-col z-50">
            <div className="p-8 flex items-center space-x-3">
                <div className="bg-primary p-2 rounded-lg">
                    <Landmark className="text-dark-bg" size={24} />
                </div>
                <span className="text-xl font-black tracking-[0.3em] text-white">PAYTONA</span>
            </div>

            <nav className="flex-grow px-4 mt-4 space-y-2">
                <p className="px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Main Menu</p>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive(item.path)
                                ? 'bg-primary text-dark-bg font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon size={20} className={isActive(item.path) ? 'text-dark-bg' : 'group-hover:text-primary'} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-white/5 p-4 rounded-2xl mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-[10px] text-gray-500 truncate capitalize">{user?.role || 'Member'}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                    <LogOut size={20} />
                    <span className="font-semibold">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
