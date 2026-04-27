import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MinusCircle, Wallet, ArrowRight, ArrowUpCircle, AlertCircle } from 'lucide-react';

export default function WithdrawPage() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            const res = await api.get(`/accounts/${user.id}`);
            setAccounts(res.data);
            if (res.data.length > 0) setSelectedAccount(res.data[0].account_no);
        };
        fetchAccounts();
    }, [user.id]);

    const handleWithdraw = async (e) => {
        e.preventDefault();

        const accInfo = accounts.find(a => a.account_no == selectedAccount);
        if (accInfo && Number(accInfo.balance) < Number(amount)) {
            toast.error('Insufficient vault balance!');
            return;
        }

        setLoading(true);
        try {
            await api.post('/transactions/withdraw', {
                account_no: selectedAccount,
                amount: amount,
                description: 'Vault Outbound'
            });
            toast.success('Capitial Extracted Successfully', { icon: '💸' });
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Extraction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center space-x-4">
                <div className="bg-red-500/10 p-4 rounded-3xl text-red-500">
                    <MinusCircle size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-white">Withdraw Capital</h1>
                    <p className="text-gray-500 font-medium text-sm">Release liquidity from your Infinity vaults.</p>
                </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 pointer-events-none">
                    <AlertCircle size={200} />
                </div>

                <form onSubmit={handleWithdraw} className="space-y-8 relative z-10">
                    {accounts.length === 0 ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl text-center font-bold italic">
                            Authorization Error: Access to zero vaults verified.
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Source Vault</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                            <Wallet size={18} />
                                        </div>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 px-11 py-5 rounded-2xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-bold text-lg appearance-none cursor-pointer"
                                            value={selectedAccount}
                                            onChange={(e) => setSelectedAccount(e.target.value)}
                                            required
                                        >
                                            {accounts.map(acc => (
                                                <option key={acc.account_no} value={acc.account_no} className="bg-dark-surface text-white">
                                                    {acc.acc_type} • {acc.account_no}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-bold px-2 uppercase tracking-tight">
                                        Max Unlockable: ₹{parseFloat(accounts.find(a => a.account_no == selectedAccount)?.balance || 0).toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Amount to Release (₹)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-500 transition-colors font-bold text-xl">
                                            ₹
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-11 py-5 rounded-2xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-bold text-2xl placeholder:text-gray-700"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedAccount}
                                className="w-full bg-white text-dark-bg py-6 rounded-2xl font-black text-xl hover:bg-gray-100 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center space-x-3"
                            >
                                {loading ? (
                                    <div className="w-7 h-7 border-4 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <ArrowUpCircle size={24} />
                                        <span>Authorize Release</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </form>
            </div>

            {/* Outbound Info */}
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-red-950/20">
                <div className="flex items-center space-x-4 mb-4">
                    <AlertCircle className="text-red-500" size={24} />
                    <h4 className="text-xl font-black italic">Security Protocol</h4>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                    By authorizing this release, you acknowledge that the funds will be deducted from your vault instantly.
                    Ensure your account number and intended extraction amount are verified before confirmation.
                </p>
            </div>
        </div>
    );
}
