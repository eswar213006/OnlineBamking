import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { TrendingUp, Lock, Calendar, Wallet, Landmark, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function FDPage() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [fds, setFds] = useState([]);
    const [fromAccount, setFromAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState(12);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const [accs, fdsRes] = await Promise.all([
                api.get(`/accounts/${user.id}`),
                api.get(`/features/fd/${user.id}`)
            ]);
            setAccounts(accs.data);
            setFds(fdsRes.data);
            if (accs.data.length > 0) setFromAccount(accs.data[0].account_no);
        };
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/features/fd', {
                account_no: fromAccount,
                amount,
                duration_months: parseInt(duration)
            });
            toast.success('Wealth Locked in high-yield vault');
            setAmount('');
            // Refresh
            const fdsRes = await api.get(`/features/fd/${user.id}`);
            setFds(fdsRes.data);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Authorization denied');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-4 rounded-3xl text-primary">
                    <TrendingUp size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-white">Fixed Protocols</h1>
                    <p className="text-gray-500 font-medium text-sm">Lock liquidity to maximize velocity outcomes.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-12">
                {/* Creator Form */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-10 rounded-[3rem] border border-white/10 space-y-8">
                        <div className="flex items-center space-x-2">
                            <Lock size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Initialize Protocol</h2>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-gray-500 ml-2">Source Vault</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none focus:border-primary/50 font-bold text-lg appearance-none cursor-pointer"
                                    value={fromAccount}
                                    onChange={e => setFromAccount(e.target.value)}
                                    required
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.account_no} value={acc.account_no} className="bg-dark-surface">
                                            {acc.acc_type} • {acc.account_no}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-gray-500 ml-2">Liquidity Amount</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-2xl">₹</span>
                                    <input
                                        type="number" required value={amount} onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 pl-12 pr-6 py-5 rounded-3xl outline-none focus:border-primary/50 font-black text-2xl"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-gray-500 ml-2">Lock Duration (Months)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[6, 12, 24, 36].map(m => (
                                        <button
                                            key={m} type="button"
                                            onClick={() => setDuration(m)}
                                            className={`py-3 rounded-xl text-sm font-black transition-all ${duration === m ? 'bg-primary text-dark-bg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                        >
                                            {m}M
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-emerald-950/20 p-6 rounded-3xl border border-primary/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase text-gray-500">Yield Rate</span>
                                    <span className="text-primary font-black">7.50% P.A.</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-gray-500">Projected Interest</span>
                                    <span className="text-white font-black italic">₹{(amount * 0.075 * (duration / 12)).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-primary text-dark-bg py-5 rounded-3xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                {loading ? 'Locking Wealth...' : 'Authorize Lock'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Active FDs */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 italic">Active Protocols ({fds.length})</h2>
                        <div className="bg-primary/20 px-3 py-1 rounded-full text-[10px] font-black text-primary animate-pulse whitespace-nowrap">
                            ACCUMULATING YIELD
                        </div>
                    </div>

                    <div className="space-y-6">
                        {fds.map(fd => (
                            <div key={fd.fd_id} className="glass-card p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 h-full flex flex-col justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                                    <ShieldCheck size={80} className="text-primary" />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-primary/20 p-2 rounded-xl text-primary">
                                                <Wallet size={18} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Index: #{fd.fd_id}</p>
                                        </div>
                                        <h3 className="text-4xl font-black text-white italic">₹{parseFloat(fd.amount).toLocaleString()}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Maturity Date</p>
                                            <div className="flex items-center space-x-2 text-white font-bold">
                                                <Calendar size={14} className="text-primary" />
                                                <span>{new Date(fd.maturity_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Growth Rate</p>
                                            <div className="flex items-center space-x-2 text-primary font-black italic">
                                                <ArrowUpRight size={14} />
                                                <span>{fd.interest_rate}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">
                                            {fd.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {fds.length === 0 && (
                            <div className="py-20 glass-card rounded-[3rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center space-y-6 text-center">
                                <div className="bg-primary/5 p-8 rounded-full text-gray-800">
                                    <Landmark size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black italic text-gray-400 uppercase tracking-tight">System Liquidity is 100% Mobile</h3>
                                    <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Initialize a high-growth protocol to secure capital velocity.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
