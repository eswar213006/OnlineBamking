import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Wallet, Smartphone, ShieldCheck, QrCode, ArrowRight, User as UserIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function UPIPage() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [fromAccount, setFromAccount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [enteredOtp, setEnteredOtp] = useState('');
    const [txnId, setTxnId] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            const res = await api.get(`/accounts/${user.id}`);
            setAccounts(res.data);
            if (res.data.length > 0) setFromAccount(res.data[0].account_no);
        };
        fetchAccounts();
    }, [user.id]);

    const handleInitiateUPI = async (e) => {
        e.preventDefault();

        if (!upiId.includes('@')) {
            toast.error('Invalid UPI handle format');
            return;
        }

        const accInfo = accounts.find(a => a.account_no == fromAccount);
        if (accInfo && Number(accInfo.balance) < Number(amount)) {
            toast.error('Insufficient vault balance!');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/transactions/upi/initiate', {
                from_account: fromAccount,
                upi_id: upiId,
                amount: amount,
                description: description
            });

            setTxnId(res.data.txn_id);
            setShowOtpModal(true);
            toast(`UPI Secure PIN: ${res.data.demo_otp}`, { icon: '🔐', duration: 15000 });

        } catch (error) {
            toast.error(error.response?.data?.error || 'UPI Authorization Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!enteredOtp || enteredOtp.length !== 6) return toast.error("Complete PIN required");

        setLoading(true);
        try {
            await api.post('/transactions/transfer', {
                txn_id: txnId,
                otp: enteredOtp
            });

            setShowOtpModal(false);
            toast.success('Funds Dispatched via UPI', { icon: '⚡' });
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'PIN Validation Failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in relative pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-4 rounded-3xl text-primary">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tight text-white">UPI Payment</h1>
                        <p className="text-gray-500 font-medium text-sm">Lightning fast transfers via Paytona Handles.</p>
                    </div>
                </div>

                <div className="hidden md:flex space-x-3">
                    <div className="p-4 glass-card rounded-2xl flex items-center space-x-3 border border-white/5">
                        <QrCode size={20} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">My QR</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-10">
                {/* Main Form */}
                <div className="lg:col-span-3">
                    <div className="glass-card rounded-[3rem] border border-white/10 overflow-hidden">
                        <form onSubmit={handleInitiateUPI} className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Debit From</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Wallet size={20} />
                                    </div>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 px-14 py-5 rounded-3xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg appearance-none cursor-pointer"
                                        value={fromAccount}
                                        onChange={(e) => setFromAccount(e.target.value)}
                                        required
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.account_no} value={acc.account_no} className="bg-dark-surface text-white">
                                                {acc.acc_type} • {acc.account_no}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p className="px-5 text-[10px] font-black text-primary uppercase">Available: ₹{parseFloat(accounts.find(a => a.account_no == fromAccount)?.balance || 0).toLocaleString()}</p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Recipient UPI Handle</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Smartphone size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 px-14 py-5 rounded-3xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xl placeholder:text-gray-700"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="user@paytona"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Amount (₹)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-primary font-black text-2xl">
                                        ₹
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        required
                                        className="w-full bg-white/5 border border-white/10 px-14 py-5 rounded-3xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-black text-3xl placeholder:text-gray-800"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !fromAccount}
                                className="w-full bg-primary text-dark-bg py-5 rounded-3xl font-black text-xl hover:scale-[1.01] transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 active:scale-95 mt-4"
                            >
                                {loading ? (
                                    <div className="w-7 h-7 border-4 border-dark-bg/20 border-t-dark-bg rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Zap size={24} />
                                        <span>Instant Pay</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary/20 p-2 rounded-xl text-primary">
                                <UserIcon size={18} />
                            </div>
                            <h3 className="font-black italic text-lg">My Identity</h3>
                        </div>

                        <div className="space-y-4">
                            {accounts.map(acc => (
                                <div key={acc.account_no} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{acc.acc_type} Vault</p>
                                    <p className="text-sm font-bold text-white tracking-widest">{acc.upi_id}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/5 flex flex-col items-center space-y-4">
                            <div className="p-5 bg-white rounded-3xl shadow-2xl shadow-primary/20">
                                <QRCodeSVG
                                    value={accounts.find(a => a.account_no == fromAccount)?.upi_id || 'paytona://pay'}
                                    size={140}
                                    fgColor="#05070a"
                                    includeMargin={false}
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Global P2P Handle</p>
                                <p className="text-xs font-black text-primary italic">{accounts.find(a => a.account_no == fromAccount)?.upi_id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-emerald-950/20">
                        <div className="flex items-center space-x-3 mb-3">
                            <ShieldCheck className="text-primary" size={18} />
                            <h4 className="text-sm font-black italic uppercase tracking-widest">Protocol Guard</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                            UPI payments are finalized instantly. Ensure recipient handles are verified before authorization.
                        </p>
                    </div>
                </div>
            </div>

            {/* OTP Modal Overlay */}
            {showOtpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-bg/95 backdrop-blur-xl animate-fade-in">
                    <div className="glass-card w-full max-w-md p-10 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center text-center space-y-8">
                        <div className="bg-primary/10 p-5 rounded-[2rem] text-primary">
                            <Zap size={48} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic tracking-tight">UPI Secure Auth</h3>
                            <p className="text-gray-500 font-medium">Enter the 6-digit PIN to release funds</p>
                        </div>

                        <input
                            type="text"
                            maxLength="6"
                            autoFocus
                            placeholder="••••••"
                            className="w-full bg-white/5 border border-white/10 text-center tracking-[0.8em] text-4xl py-6 rounded-3xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-black text-white"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        />

                        <div className="flex w-full space-x-4">
                            <button
                                onClick={() => { setShowOtpModal(false); setEnteredOtp(''); }}
                                className="flex-1 px-4 py-4 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || enteredOtp.length !== 6}
                                className="flex-[2] px-4 py-4 rounded-2xl bg-primary text-dark-bg font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Validating...' : 'Authorize Pay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
