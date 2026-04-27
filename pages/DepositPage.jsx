import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusCircle, Wallet, ArrowRight, ArrowDownCircle } from 'lucide-react';

export default function DepositPage() {
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

    const handleDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions/deposit', {
                account_no: selectedAccount,
                amount: amount,
                description: 'Vault Inbound'
            });
            toast.success('Funds Injected Successfully', { icon: '💰' });
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Injection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-4 rounded-3xl text-primary">
                    <PlusCircle size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight">Deposit Funds</h1>
                    <p className="text-gray-500 font-medium">Inject capital into your premium vaults.</p>
                </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] border border-white/10">
                <form onSubmit={handleDeposit} className="space-y-8">
                    {accounts.length === 0 ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl text-center font-bold">
                            Security Alert: No active vaults detected. Initialize a vault from the Dashboard.
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2 text-primary">Target Vault</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                            <Wallet size={18} />
                                        </div>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 px-11 py-5 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg appearance-none cursor-pointer"
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
                                        Current Balance: ₹{parseFloat(accounts.find(a => a.account_no == selectedAccount)?.balance || 0).toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Injection Amount (₹)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary transition-colors font-bold text-xl">
                                            ₹
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-11 py-5 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-2xl placeholder:text-gray-700"
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
                                className="w-full bg-primary text-dark-bg py-6 rounded-2xl font-black text-xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3"
                            >
                                {loading ? (
                                    <div className="w-7 h-7 border-4 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <ArrowDownCircle size={24} />
                                        <span>Confirm Deposit</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </form>
            </div>

            {/* Inbound Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-[2.5rem] flex items-start space-x-4 border border-white/5">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
                        <ArrowRight size={20} className="rotate-45" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black italic">Instant Credit</h4>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">Funds are settled immediately into your selected vault after authorization.</p>
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[2.5rem] flex items-start space-x-4 border border-white/5">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
                        <ArrowRight size={20} className="rotate-45" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black italic">Zero Fee</h4>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">Infinity Bank does not charge any hidden fees for internal vault injections.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
