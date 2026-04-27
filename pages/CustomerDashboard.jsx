import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    CreditCard,
    ArrowRightLeft,
    PlusCircle,
    MinusCircle,
    History,
    Landmark,
    Sparkles,
    TrendingUp,
    ShieldCheck,
    PieChart as PieIcon,
    ArrowUpRight,
    Search,
    AlertCircle
} from 'lucide-react';
import TransactionChart from '../components/TransactionChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function CustomerDashboard() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [debtAmount, setDebtAmount] = useState(0);
    const [creditScore, setCreditScore] = useState(720); // Simulated
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [accRes, analyticsRes, loansRes] = await Promise.allSettled([
                    api.get(`/accounts/${user.id}`),
                    api.get(`/transactions/analytics/${user.id}`),
                    api.get(`/loans/${user.id}`)
                ]);

                if (accRes.status === 'fulfilled') {
                    setAccounts(accRes.value.data);
                    // Simulated credit score calculation
                    const totalBalance = accRes.value.data.reduce((sum, acc) => sum + Number(acc.balance), 0);
                    const score = 600 + Math.min(250, Math.floor(totalBalance / 1000));
                    setCreditScore(score);
                }

                if (analyticsRes.status === 'fulfilled') {
                    setAnalytics(analyticsRes.value.data);
                }

                if (loansRes.status === 'fulfilled') {
                    const totalDebt = loansRes.value.data.reduce((sum, loan) => sum + Number(loan.amount), 0);
                    setDebtAmount(totalDebt);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Syncing Portfolio...</p>
            </div>
        );
    }

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tight text-white">Marketview</h1>
                    <p className="text-gray-500 font-medium mt-2">Welcome back, {user.name.split(' ')[0]}. Analyzing your wealth portfolio.</p>
                </div>

                {/* Credit Score Widget */}
                <div className="flex gap-4">
                    <div className="glass-card px-8 py-4 rounded-[2rem] border border-white/5 flex items-center space-x-6">
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                                    strokeDasharray={175.9}
                                    strokeDashoffset={175.9 * (1 - creditScore / 850)}
                                    className="text-primary"
                                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-black">{creditScore}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Credit Rating</p>
                            <h4 className="text-lg font-black text-white italic text-nowrap">EXCELLENT</h4>
                        </div>
                    </div>

                    {/* Debt Widget */}
                    <div className="glass-card px-8 py-4 rounded-[2rem] border border-red-500/20 bg-red-500/5 flex items-center space-x-6 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                        <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 animate-pulse">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Debt Exposure</p>
                            <h4 className="text-xl font-black text-white italic">₹{debtAmount.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Accounts & Analytics Grid */}
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Account Scroll */}
                <div className="lg:col-span-3 grid md:grid-cols-2 gap-8">
                    {accounts.map((account, idx) => (
                        <div
                            key={account.account_no}
                            className={`group relative h-64 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-95 ${idx % 2 === 0 ? 'emerald-gradient' : 'bg-white text-dark-bg'
                                }`}
                        >
                            <div className={`absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full blur-[80px] ${idx % 2 === 0 ? 'bg-white/20' : 'bg-primary/20'}`}></div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black opacity-60">
                                            {account.acc_type} Vault • {account.currency}
                                        </p>
                                        <h3 className="text-xl font-black mt-1 tracking-widest">PAYTONA</h3>
                                    </div>
                                    <Landmark size={24} className="opacity-40" />
                                </div>

                                <div>
                                    <p className="text-sm font-bold opacity-60">Portfolio Liquidity</p>
                                    <p className="text-4xl font-black tracking-tighter mt-1">
                                        {account.currency === 'INR' ? '₹' : '$'}{parseFloat(account.balance).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold opacity-40 leading-none">Vault ID</p>
                                        <p className="font-bold text-sm tracking-widest">{account.account_no}</p>
                                    </div>
                                    <Link 
                                        to={`/history/${account.account_no}`}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            idx % 2 === 0 ? 'bg-white/10 hover:bg-white/20' : 'bg-primary/10 hover:bg-primary/20 text-primary'
                                        }`}
                                    >
                                        View History
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Account Card */}
                    <Link to="/profile" className="h-64 glass-card border-dashed border-2 border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 hover:border-primary/50 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-dark-bg transition-all">
                            <PlusCircle size={24} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-gray-500">Open New Vault</span>
                    </Link>
                </div>

                {/* Spending Analytics Pie */}
                <div className="glass-card p-8 rounded-[3rem] border border-white/10 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-2">
                            <PieIcon size={18} className="text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Capital Leakage</h3>
                        </div>
                        <ArrowUpRight size={16} className="text-gray-600" />
                    </div>

                    <div className="flex-grow h-48 focus:outline-none">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={8}
                                    dataKey="total"
                                    stroke="none"
                                >
                                    {analytics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: '800' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {analytics.slice(0, 4).map((item, i) => (
                            <div key={item.category} className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <span className="text-[10px] font-bold text-gray-500 truncate">{item.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: History & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Big Chart */}
                <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                                <TrendingUp size={20} />
                            </div>
                            <h2 className="text-2xl font-black italic">Liquidity Velocity</h2>
                        </div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/5 px-4 py-1 rounded-full">Last 7 Protocols</div>
                    </div>
                    {accounts.length > 0 && (
                        <TransactionChart accountNo={accounts[0].account_no} />
                    )}
                </div>

                {/* Quick Actions Portal */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4 mb-6">Execution Portal</h3>
                    <ActionLink to="/transfer" icon={<ArrowRightLeft size={28} />} label="B2B Wire" color="text-blue-400" />
                    <ActionLink to="/deposit" icon={<PlusCircle size={28} />} label="Inject" color="text-emerald-400" />
                    <ActionLink to="/withdraw" icon={<MinusCircle size={28} />} label="Extract" color="text-red-400" />
                    <ActionLink to={accounts.length > 0 ? `/history/${accounts[0].account_no}` : '/dashboard'} icon={<History size={28} />} label="Audit" color="text-purple-400" />
                </div>
            </div>
        </div>
    );
}

function ActionLink({ to, icon, label, color }) {
    return (
        <Link
            to={to}
            className="group flex items-center justify-between p-5 glass-card rounded-3xl hover:bg-white/5 transition-all duration-300 border border-white/5"
        >
            <div className="flex items-center space-x-4">
                <div className={`${color} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <span className="text-sm font-black italic tracking-tight">{label}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-dark-bg transition-colors">
                <ArrowUpRight size={14} />
            </div>
        </Link>
    );
}
