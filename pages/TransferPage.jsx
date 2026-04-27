import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowRightLeft, Wallet, User as UserIcon, ShieldCheck, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function TransferPage() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP State
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

    const handleInitiateTransfer = async (e) => {
        e.preventDefault();

        const accInfo = accounts.find(a => a.account_no == fromAccount);
        if (accInfo && Number(accInfo.balance) < Number(amount)) {
            toast.error('Insufficient vault balance!');
            return;
        }

        if (fromAccount === toAccount) {
            toast.error('Self-transfer to same account prohibited.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/transactions/transfer/initiate', {
                from_account: fromAccount,
                to_account: toAccount,
                amount: amount,
                description: description || 'Vault Transfer'
            });

            setTxnId(res.data.txn_id);
            setShowOtpModal(true);
            toast(`Security PIN: ${res.data.demo_otp}`, { icon: '🔐', duration: 15000 });

        } catch (error) {
            toast.error(error.response?.data?.error || 'Authorization Failed');
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
            toast.success('Funds Transferred Sucessfully', { icon: '🚀' });
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'PIN Validation Failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in relative pb-20">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-4 rounded-3xl text-primary">
                    <ArrowRightLeft size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-white">Transfer Assets</h1>
                    <p className="text-gray-500 font-medium text-sm">Move capital securely between Infinity accounts.</p>
                </div>
            </div>

            <div className="glass-card rounded-[3rem] border border-white/10 overflow-hidden">
                <form onSubmit={handleInitiateTransfer} className="p-10 md:p-14 space-y-10">
                    {accounts.length === 0 ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-[2rem] text-center font-bold">
                            Restricted: No authorized vaults found for this user.
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 gap-10">
                                {/* From Account */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Source Vault</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                            <Wallet size={20} />
                                        </div>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 px-14 py-6 rounded-3xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xl appearance-none"
                                            value={fromAccount}
                                            onChange={(e) => setFromAccount(e.target.value)}
                                            required
                                            disabled={showOtpModal}
                                        >
                                            {accounts.map(acc => (
                                                <option key={acc.account_no} value={acc.account_no} className="bg-dark-surface text-white">
                                                    {acc.acc_type} • {acc.account_no}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="px-5 text-[10px] font-black text-primary uppercase">Current: ₹{parseFloat(accounts.find(a => a.account_no == fromAccount)?.balance || 0).toLocaleString()}</p>
                                </div>

                                {/* To Account */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Destination Account</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                            <UserIcon size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-14 py-6 rounded-3xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xl placeholder:text-gray-700"
                                            value={toAccount}
                                            onChange={(e) => setToAccount(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Recipient ID / A/C No"
                                            disabled={showOtpModal}
                                        />
                                    </div>
                                    <p className="px-5 text-[10px] font-black text-gray-600 uppercase">Verification Required</p>
                                </div>

                                {/* Amount */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Transfer Amount (₹)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-primary font-black text-2xl">
                                            ₹
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-14 py-6 rounded-3xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-black text-3xl placeholder:text-gray-800"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            disabled={showOtpModal}
                                        />
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Reference Remark</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 transition-colors">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 px-14 py-6 rounded-3xl outline-none focus:border-primary/50 transition-all font-medium placeholder:text-gray-700"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Purpose of transfer"
                                            disabled={showOtpModal}
                                        />
                                    </div>
                                </div>
                            </div>

                            {!showOtpModal && (
                                <button
                                    type="submit"
                                    disabled={loading || !fromAccount}
                                    className="w-full emerald-gradient text-dark-bg py-6 rounded-3xl font-black text-xl hover:scale-[1.01] transition-all shadow-[0_0_50px_rgba(16,185,129,0.2)] flex items-center justify-center space-x-3 active:scale-95"
                                >
                                    {loading ? (
                                        <div className="w-8 h-8 border-4 border-dark-bg/20 border-t-dark-bg rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <ShieldCheck size={24} />
                                            <span>Initiate Secure Protocol</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </form>
            </div>

            {/* Transfer Guardrails */}
            <div className="grid md:grid-cols-3 gap-6">
                <GuardrailCard icon={<CheckCircle2 size={18} />} text="Anti-Fraud Engine Active" />
                <GuardrailCard icon={<Info size={18} />} text="T+0 Settlement" />
                <GuardrailCard icon={<ShieldCheck size={18} />} text="E2E Encrypted Routing" />
            </div>

            {/* OTP Modal Overlay */}
            {showOtpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-bg/95 backdrop-blur-xl animate-fade-in">
                    <div className="glass-card w-full max-w-md p-10 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center text-center space-y-8">
                        <div className="bg-primary/10 p-5 rounded-[2rem] text-primary">
                            <ShieldCheck size={48} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic tracking-tight">Identity Check</h3>
                            <p className="text-gray-500 font-medium">Verify the 6-digit PIN authorized to your device</p>
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
                                Abort
                            </button>
                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || enteredOtp.length !== 6}
                                className="flex-[2] px-4 py-4 rounded-2xl bg-primary text-dark-bg font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Validating...' : 'Auth Transaction'}
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Protocol ID: {txnId.slice(-8)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function GuardrailCard({ icon, text }) {
    return (
        <div className="glass-card px-6 py-4 rounded-2xl flex items-center space-x-3 border border-white/5 opacity-80">
            <div className="text-primary">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{text}</span>
        </div>
    );
}
