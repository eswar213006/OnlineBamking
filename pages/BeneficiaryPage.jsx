import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, User, Trash2, Smartphone, Landmark, Search, ShieldCheck } from 'lucide-react';

export default function BeneficiaryPage() {
    const { user } = useContext(AuthContext);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [type, setType] = useState('BANK');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBeneficiaries();
    }, []);

    const fetchBeneficiaries = async () => {
        try {
            const res = await api.get(`/features/beneficiaries/${user.id}`);
            setBeneficiaries(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/features/beneficiaries', {
                custid: user.id,
                name,
                account_no_or_upi: identifier,
                type
            });
            toast.success('Payee registered under security protocols');
            setName('');
            setIdentifier('');
            fetchBeneficiaries();
        } catch (error) {
            toast.error('Failed to register payee');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/features/beneficiaries/${id}`);
            toast.success('Payee purged from records');
            fetchBeneficiaries();
        } catch (error) {
            toast.error('Purge failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-4 rounded-3xl text-primary">
                    <UserIcon size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-white">Payee Registry</h1>
                    <p className="text-gray-500 font-medium text-sm">Secure management of frequent transaction protocols.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 space-y-8 sticky top-10">
                        <div className="flex items-center space-x-2">
                            <UserPlus size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Register Payee</h2>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 ml-2">Display Name</label>
                                <input
                                    type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 font-bold"
                                    placeholder="e.g. Corporate Vendor"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 ml-2">Identifier</label>
                                <input
                                    type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 font-bold"
                                    placeholder={type === 'BANK' ? 'Account No' : 'user@paytona'}
                                />
                            </div>

                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                <div className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase text-center bg-primary text-dark-bg shadow-lg">
                                    Bank Wire Only
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-primary text-dark-bg py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                {loading ? 'Registering...' : 'Add to Registry'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Authorized Payees ({beneficiaries.length})</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {beneficiaries.map((b) => (
                            <div key={b.id} className="glass-card p-6 rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic ${b.type === 'BANK' ? 'bg-blue-500/10 text-blue-400' : 'bg-primary/10 text-primary'}`}>
                                        {b.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white italic">{b.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mt-1">
                                            {b.type} • {b.account_no_or_upi}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(b.id)}
                                    className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-400/5 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {beneficiaries.length === 0 && (
                            <div className="col-span-full py-20 glass-card rounded-[3rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="bg-white/5 p-4 rounded-full text-gray-700">
                                    <Search size={32} />
                                </div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs leading-relaxed">Registry is currently void.<br />Register frequent protocols to accelerate execution.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserIcon({ size }) {
    return <User size={size} />;
}
