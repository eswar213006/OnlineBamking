import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, History, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionHistoryPage() {
    const { account_no } = useParams();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/transactions/history/${account_no}`);
                setTransactions(res.data);
            } catch (error) {
                console.error("Failed to fetch history");
            }
        };
        fetchHistory();
    }, [account_no]);

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="p-3 bg-white/5 rounded-2xl text-gray-400 hover:text-primary transition-all duration-300">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tight text-white flex items-center space-x-3">
                            <History size={32} className="text-primary" />
                            <span>Vault Logs</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Audit trail for account • {account_no}</p>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button className="flex items-center space-x-2 px-6 py-3 glass-card rounded-2xl text-sm font-bold text-gray-400 hover:text-white transition-all">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl text-sm font-bold text-primary hover:bg-primary hover:text-dark-bg transition-all">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-500">Timestamp</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-500">Description</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-500">Category</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-500">Protocol</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-500 text-right">Magnitude (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map(txn => (
                            <tr key={txn.txn_id} className="group hover:bg-white/5 transition-all duration-300">
                                <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-400">
                                    <div className="flex flex-col">
                                        <span>{format(new Date(txn.txn_date), 'MMM dd, yyyy')}</span>
                                        <span className="text-[10px] opacity-40 uppercase tracking-tighter">{format(new Date(txn.txn_date), 'HH:mm:ss')}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-white italic tracking-tight">
                                    {txn.description}
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                    {txn.category}
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                        ${txn.txn_type === 'CREDIT' ? 'bg-primary/20 text-primary' :
                                            txn.txn_type === 'DEBIT' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}
                                    >
                                        <div className={`w-1 h-1 rounded-full ${txn.txn_type === 'CREDIT' ? 'bg-primary' : txn.txn_type === 'DEBIT' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        <span>{txn.txn_type}</span>
                                    </span>
                                </td>
                                <td className={`px-8 py-6 whitespace-nowrap text-lg font-black text-right tracking-tighter
                                    ${txn.txn_type === 'CREDIT' ? 'text-primary' : 'text-red-500'}`}
                                >
                                    {txn.txn_type === 'CREDIT' ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-8 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="bg-white/5 p-6 rounded-full text-gray-600">
                                            <History size={48} />
                                        </div>
                                        <p className="text-xl font-bold italic">No Transaction Protocols Detected</p>
                                        <p className="text-sm font-medium">Your account ledger is currently clean of any activity.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
