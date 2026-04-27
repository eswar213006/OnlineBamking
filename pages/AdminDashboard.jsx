import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ShieldCheck, Users, Wallet, History, Trash2, Search, Filter } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('customers');
    const [customers, setCustomers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const fetchData = async () => {
        try {
            if (activeTab === 'customers') {
                const res = await api.get('/admin/customers');
                setCustomers(res.data);
            } else if (activeTab === 'accounts') {
                const res = await api.get('/admin/accounts');
                setAccounts(res.data);
            } else if (activeTab === 'transactions') {
                const res = await api.get('/admin/transactions');
                setTransactions(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm('CRITICAL: Are you sure you want to delete this customer? This will permanently cascade and destroy all associated accounts and transactions.')) return;
        try {
            await api.delete(`/admin/customer/${id}`);
            toast.success('Subject Purged');
            fetchData();
        } catch (error) {
            toast.error('Purge Failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-white flex items-center space-x-3">
                        <ShieldCheck size={36} className="text-primary" />
                        <span>Paytona Oversight</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Master control for Paytona protocols.</p>
                </div>

                <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                    <TabButton active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<Users size={16} />} label="Subjects" />
                    <TabButton active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Wallet size={16} />} label="Vaults" />
                    <TabButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<History size={16} />} label="Ledger" />
                </div>
            </div>

            {/* Content Table */}
            <div className="glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Master Data Stream</h3>
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={14} />
                            <input type="text" placeholder="Global Search..." className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-primary/50 transition-all" />
                        </div>
                        <button className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'customers' && (
                        <table className="w-full text-left">
                            <thead className="bg-dark-surface/50 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Identifer</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Communication</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {customers.map(c => (
                                    <tr key={c.custid} className="group hover:bg-white/5 transition-all">
                                        <td className="px-8 py-5 text-xs font-bold text-gray-500 font-mono">#{c.custid}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">{c.name.charAt(0)}</div>
                                                <span className="text-sm font-bold text-white tracking-tight">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400">{c.email}</span>
                                                <span className="text-[10px] font-bold text-gray-600">{c.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => handleDeleteCustomer(c.custid)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'accounts' && (
                        <table className="w-full text-left">
                            <thead className="bg-dark-surface/50 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Vault Number</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Classification</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Origin Branch</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Liquidity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {accounts.map(a => (
                                    <tr key={a.account_no} className="group hover:bg-white/5 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white font-mono">{a.account_no}</span>
                                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Owner: {a.customer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">{a.acc_type}</span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-gray-500">{a.branch_name}</td>
                                        <td className="px-8 py-5 text-right text-lg font-black text-primary tracking-tighter">₹{parseFloat(a.balance).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'transactions' && (
                        <table className="w-full text-left">
                            <thead className="bg-dark-surface/50 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Source Vault</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Protocol</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Magnitude</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map(t => (
                                    <tr key={t.txn_id} className="group hover:bg-white/5 transition-all">
                                        <td className="px-8 py-5 text-xs font-bold text-gray-500">{format(new Date(t.txn_date), 'MMM dd, HH:mm')}</td>
                                        <td className="px-8 py-5 text-sm font-black text-white font-mono tracking-tighter">{t.account_no}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                ${t.txn_type === 'CREDIT' ? 'bg-primary/20 text-primary' :
                                                    t.txn_type === 'DEBIT' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}
                                            >
                                                <span>{t.txn_type}</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right text-sm font-black text-white tracking-widest">₹{parseFloat(t.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${active ? 'bg-primary text-dark-bg shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
