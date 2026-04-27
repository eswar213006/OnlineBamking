import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    CheckCircle2,
    CreditCard,
    Landmark,
    ArrowRight,
    Zap,
    Target,
    Calculator,
    ShieldCheck,
    TrendingUp,
    ChevronRight,
    CircleDollarSign,
    RefreshCcw,
    Wallet,
    PlusCircle,
    Sparkles
} from 'lucide-react';

export default function LoanPage() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [availableLoans, setAvailableLoans] = useState([]);
    const [myLoans, setMyLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [repaySource, setRepaySource] = useState('');
    const [repayAmounts, setRepayAmounts] = useState({}); // To track inputs for each loan
    const [customLoan, setCustomLoan] = useState({ type: 'Business Expansion', amount: '1000000', branch_id: '' });
    const [branches, setBranches] = useState([]);

    // Calculator States
    const [calcAmount, setCalcAmount] = useState(500000);
    const [calcMonths, setCalcMonths] = useState(12);
    const [interestRate] = useState(10.5); // Fixed for demo

    const fetchLoans = async () => {
        try {
            const [allRes, myRes, accRes, branchRes] = await Promise.all([
                api.get('/loans'),
                api.get(`/loans/${user.id}`),
                api.get(`/accounts/${user.id}`),
                api.get('/accounts/branches/all')
            ]);
            setAvailableLoans(allRes.data);
            setMyLoans(myRes.data);
            setAccounts(accRes.data);
            setBranches(branchRes.data);
            if (accRes.data.length > 0) setRepaySource(accRes.data[0].account_no);
            if (branchRes.data.length > 0) setCustomLoan(prev => ({ ...prev, branch_id: branchRes.data[0].branch_id }));
        } catch (error) {
            console.error("Failed to fetch loans");
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [user.id]);

    const handleApply = async (loan_id) => {
        setLoading(true);
        try {
            await api.post('/loans/apply', { custid: user.id, loan_id });
            toast.success('Capital Application Dispatched', { icon: '🚀' });
            fetchLoans();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Application failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomApply = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/loans/custom', { 
                custid: user.id, 
                loan_type: customLoan.type, 
                amount: customLoan.amount,
                branch_id: customLoan.branch_id
            });
            toast.success('Custom Strategic Capital Approved', { icon: '🔥' });
            fetchLoans();
        } catch (error) {
            toast.error('Custom application failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRepay = async (loan_id, isFull = true) => {
        if (!repaySource) {
            toast.error('Please select a source vault for repayment');
            return;
        }
        
        const amount = isFull ? null : repayAmounts[loan_id];
        if (!isFull && (!amount || amount <= 0)) {
            toast.error('Please enter a valid repayment amount');
            return;
        }

        setLoading(true);
        try {
            await api.post('/loans/repay', {
                custid: user.id,
                loan_id,
                account_no: repaySource,
                repay_amount: amount
            });
            toast.success(isFull ? 'Liability Neutralized.' : 'Partial Repayment Settled.', { icon: '🛡️' });
            setRepayAmounts({ ...repayAmounts, [loan_id]: '' });
            fetchLoans();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Repayment execution failed');
        } finally {
            setLoading(false);
        }
    };

    const monthlyInterest = (interestRate / 100) / 12;
    const emi = (calcAmount * monthlyInterest * Math.pow(1 + monthlyInterest, calcMonths)) / (Math.pow(1 + monthlyInterest, calcMonths) - 1);
    const totalPayable = emi * calcMonths;

    const myLoanIds = myLoans.map(l => l.loan_id);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-4 rounded-3xl text-primary shadow-lg shadow-primary/10 border border-primary/20">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tight text-white">Capital Center</h1>
                        <p className="text-gray-500 font-medium text-sm">Expand your financial reach with high-velocity credit lines.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* Eligibility Widget */}
                    <div className="glass-card px-8 py-4 rounded-[2rem] border border-white/10 flex items-center space-x-6">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-primary animate-[spin_3s_linear_infinite]"></div>
                            <ShieldCheck size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Eligibility Status</p>
                            <h4 className="text-lg font-black text-white italic">PRE-APPROVED</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Repayment Source Selector */}
            {myLoans.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-primary/20 p-3 rounded-2xl text-primary">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Repayment Protocol Source</p>
                            <h3 className="text-sm font-bold text-white uppercase italic">Select Vault for Settlement</h3>
                        </div>
                    </div>
                    <select
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold text-white cursor-pointer min-w-[250px]"
                        value={repaySource}
                        onChange={e => setRepaySource(e.target.value)}
                    >
                        {accounts.map(acc => (
                            <option key={acc.account_no} value={acc.account_no} className="bg-dark-surface">
                                {acc.acc_type} (₹{parseFloat(acc.balance).toLocaleString()}) • {acc.account_no}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Column: Calculator & Application */}
                <div className="lg:col-span-8 space-y-8">
                    {/* EMI Calculator */}
                    <div className="glass-card p-10 rounded-[3rem] border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-white/5 p-3 rounded-2xl">
                                        <Calculator size={20} className="text-primary" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">Strategy Calculator</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/5 px-4 py-1 rounded-full">10.5% APR Applied</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <span>Loan Quantum</span>
                                            <span className="text-white font-black italic">₹{calcAmount.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range" min="100000" max="5000000" step="50000"
                                            className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                                            value={calcAmount} onChange={e => setCalcAmount(parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <span>Duration Protocol</span>
                                            <span className="text-white font-black italic">{calcMonths} Months</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[12, 24, 36, 60].map(m => (
                                                <button
                                                    key={m} onClick={() => setCalcMonths(m)}
                                                    className={`py-3 rounded-xl text-xs font-black transition-all ${calcMonths === m ? 'bg-primary text-dark-bg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                                >
                                                    {m}M
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-[2rem] p-8 space-y-6 flex flex-col justify-center border border-primary/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Monthly Commitment</p>
                                        <h3 className="text-5xl font-black tracking-tighter text-white">₹{Math.round(emi).toLocaleString()}</h3>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-gray-500">Total Capital Repay</span>
                                            <span className="text-white font-black">₹{Math.round(totalPayable).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-gray-500">Total Surplus Yield</span>
                                            <span className="text-primary font-black">₹{Math.round(totalPayable - calcAmount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Custom Capital Section */}
                    <div className="glass-card p-10 rounded-[3rem] border border-primary/20 bg-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Sparkles size={100} />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary p-3 rounded-2xl text-dark-bg">
                                    <PlusCircle size={24} />
                                </div>
                                <h2 className="text-xl font-black italic uppercase tracking-tight">Initialize Custom Capital</h2>
                            </div>

                            <form onSubmit={handleCustomApply} className="grid md:grid-cols-4 gap-6 items-end">
                                <div className="md:col-span-1 space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Capital Type</label>
                                    <input 
                                        type="text" required className="w-full bg-dark-bg/40 border border-white/10 p-4 rounded-xl outline-none focus:border-primary/50 text-xs font-bold text-white"
                                        value={customLoan.type} onChange={e => setCustomLoan({...customLoan, type: e.target.value})}
                                        placeholder="e.g. Asset Acquisition"
                                    />
                                </div>
                                <div className="md:col-span-1 space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Quantum (₹)</label>
                                    <input 
                                        type="number" required className="w-full bg-dark-bg/40 border border-white/10 p-4 rounded-xl outline-none focus:border-primary/50 text-xs font-bold text-primary"
                                        value={customLoan.amount} onChange={e => setCustomLoan({...customLoan, amount: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-1 space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Branch Node</label>
                                    <select 
                                        className="w-full bg-dark-bg/40 border border-white/10 p-4 rounded-xl outline-none focus:border-primary/50 text-xs font-bold text-white cursor-pointer"
                                        value={customLoan.branch_id} onChange={e => setCustomLoan({...customLoan, branch_id: e.target.value})}
                                    >
                                        {branches.map(b => (
                                            <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-primary text-dark-bg py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                    Deploy Custom
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Available Liquidity */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl font-black italic tracking-tight uppercase">Liquidity Offers</h2>
                            <TrendingUp size={20} className="text-primary opacity-50" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {availableLoans.map(loan => {
                                const isApplied = myLoanIds.includes(loan.loan_id);
                                return (
                                    <div key={loan.loan_id} className="glass-card p-10 rounded-[3rem] border border-white/10 hover:border-primary/40 transition-all duration-300 group">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-primary/10 p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                                    <Zap size={24} />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Branch Node</p>
                                                    <p className="text-xs font-bold text-white">{loan.branch_name || 'Global HQ'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black italic text-white">{loan.loan_type}</h3>
                                                <p className="text-sm font-medium text-gray-500 underline underline-offset-4 decoration-primary/30">Limit up to ₹{parseFloat(loan.amount).toLocaleString()}</p>
                                            </div>

                                            <button
                                                onClick={() => handleApply(loan.loan_id)}
                                                disabled={isApplied || loading}
                                                className={`w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center space-x-3 transition-all
                                                    ${isApplied
                                                        ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                                        : 'bg-primary text-dark-bg hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95'}`}
                                            >
                                                {isApplied ? (
                                                    <>
                                                        <CheckCircle2 size={18} />
                                                        <span>Protocol Live</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Deploy Protocol</span>
                                                        <ChevronRight size={18} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Credit Portfolio */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black italic tracking-tight uppercase">Live Portfolio</h2>
                        <CircleDollarSign size={20} className="text-gray-600" />
                    </div>

                    <div className="space-y-6">
                        {myLoans.map(loan => (
                            <div key={loan.loan_id} className="relative group">
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 rounded-[3rem] blur-xl transition-opacity"></div>
                                <div className="glass-card p-8 rounded-[3.5rem] border border-white/10 relative z-10 flex flex-col space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Active Exposure</p>
                                            </div>
                                            <h3 className="text-xl font-black italic text-white">{loan.loan_type}</h3>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-2xl text-gray-500">
                                            <Target size={20} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Outstanding Capital</p>
                                            <h4 className="text-3xl font-black tracking-tighter text-white italic">₹{parseFloat(loan.amount).toLocaleString()}</h4>
                                        </div>

                                        <div className="pt-4 space-y-3">
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-primary/50 text-xs font-bold text-white placeholder:text-gray-700"
                                                    placeholder="Partial Amount"
                                                    value={repayAmounts[loan.loan_id] || ''}
                                                    onChange={e => setRepayAmounts({ ...repayAmounts, [loan.loan_id]: e.target.value })}
                                                />
                                                <button 
                                                    onClick={() => handleRepay(loan.loan_id, false)}
                                                    className="absolute right-2 top-2 bottom-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black uppercase transition-all"
                                                >
                                                    Settle
                                                </button>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleRepay(loan.loan_id, true)}
                                                disabled={loading}
                                                className="w-full py-4 glass-card border border-primary/20 bg-primary/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-dark-bg transition-all flex items-center justify-center space-x-2 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                            >
                                                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                                                <span>Full Neutralize</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {myLoans.length === 0 && (
                            <div className="glass-card p-16 rounded-[4rem] text-center border-dashed border-2 border-white/5 flex flex-col items-center justify-center space-y-6 opacity-60">
                                <div className="bg-white/5 p-8 rounded-full text-gray-800">
                                    <Target size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black italic text-gray-500 uppercase tracking-tight">Zero Liabilities</h3>
                                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest max-w-[150px] mx-auto">Your credit engine is available for strategic deployment.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
