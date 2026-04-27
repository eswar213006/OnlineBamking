import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, ShieldCheck, Mail, Phone, MapPin, Save, Landmark, PlusCircle, Sparkles } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState({ name: '', phone: '', address: '', email: '' });
    const [branches, setBranches] = useState([]);
    const [newAccount, setNewAccount] = useState({ acc_type: 'Savings', branch_id: '', initial_deposit: '' });
    const [loading, setLoading] = useState(false);
    const [accLoading, setAccLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profRes = await api.get(`/customer/${user.id}`);
                setProfile(profRes.data);
            } catch (err) {
                console.error("Profile fetch failed", err);
            }

            try {
                const branchRes = await api.get('/accounts/branches/all');
                setBranches(branchRes.data);
                if (branchRes.data.length > 0) {
                    setNewAccount(prev => ({ ...prev, branch_id: branchRes.data[0].branch_id }));
                }
            } catch (err) {
                console.error("Branches fetch failed", err);
                toast.error("Failed to load bank branches");
            }
        };
        fetchData();
    }, [user.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/customer/${user.id}`, { name: profile.name, phone: profile.phone, address: profile.address });
            toast.success('Security Profile Updated Successfully');
        } catch (error) {
            toast.error('Profile update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setAccLoading(true);
        try {
            await api.post('/accounts', {
                custid: user.id,
                acc_type: newAccount.acc_type,
                branch_id: newAccount.branch_id,
                initial_deposit: newAccount.initial_deposit
            });
            toast.success('New Vault Initialized Successfully!', { icon: '💎' });
            setNewAccount({ acc_type: 'Savings', branch_id: branches[0]?.branch_id || '', initial_deposit: '' });
        } catch (error) {
            toast.error('Vault initialization failed');
        } finally {
            setAccLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-4 rounded-3xl text-primary">
                    <User size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-white">Security Profile</h1>
                    <p className="text-gray-500 font-medium text-sm">Manage your personal identification and vault recovery data.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Profile Card Summary */}
                <div className="glass-card p-10 rounded-[3rem] border border-white/10 flex flex-col items-center text-center space-y-6">
                    <div className="w-32 h-32 rounded-full emerald-gradient flex items-center justify-center p-1 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                        <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center text-primary text-4xl font-black italic">
                            {profile.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black">{profile.name}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Authorized Member</p>
                    </div>
                    <div className="w-full pt-4 border-t border-white/5 space-y-4 text-left">
                        <div className="flex items-center space-x-3 text-sm">
                            <ShieldCheck className="text-primary opacity-50" size={16} />
                            <span className="text-gray-400 font-medium uppercase tracking-tighter text-[10px]">Verification Level: Emerald</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Landmark className="text-primary opacity-50" size={16} />
                            <span className="text-gray-400 font-medium uppercase tracking-tighter text-[10px]">Home Branch: Tambaram</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] border border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-8 border-l-4 border-primary pl-4">Identification Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Universal ID (Read Only)</label>
                                <div className="relative group opacity-50 text-gray-400 cursor-not-allowed">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={18} />
                                    </div>
                                    <input type="email" readOnly className="w-full bg-white/5 border border-white/5 px-11 py-4 rounded-2xl outline-none font-medium cursor-not-allowed" value={profile.email} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Primary Phone</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-white/5 border border-white/10 px-11 py-4 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-gray-600"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Full Legal Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 px-11 py-4 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-gray-600"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Physical Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 pt-4 flex items-start pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-white/5 border border-white/10 px-11 py-4 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-gray-600"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-dark-bg py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Update Identity Details</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Account Creation Section */}
            <div className="glass-card p-10 rounded-[3rem] border border-primary/20 bg-primary/5 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles size={120} />
                </div>
                
                <div className="flex items-center space-x-4 mb-10">
                    <div className="bg-primary p-3 rounded-2xl text-dark-bg">
                        <PlusCircle size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic">Initialize New Vault</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Expansion Protocol</p>
                    </div>
                </div>

                <form onSubmit={handleCreateAccount} className="grid md:grid-cols-3 gap-8 items-end">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Vault Type</label>
                        <select
                            className="w-full bg-dark-bg/50 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary/50 transition-all font-bold text-white cursor-pointer"
                            value={newAccount.acc_type}
                            onChange={(e) => setNewAccount({ ...newAccount, acc_type: e.target.value })}
                        >
                            <option value="Savings">Savings Vault</option>
                            <option value="Current">Current Vault</option>
                            <option value="Business">Business Vault</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Assigned Branch</label>
                        <select
                            className="w-full bg-dark-bg/50 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary/50 transition-all font-bold text-white cursor-pointer"
                            value={newAccount.branch_id}
                            onChange={(e) => setNewAccount({ ...newAccount, branch_id: e.target.value })}
                            required
                        >
                            {branches.map(b => (
                                <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1 text-primary">Initial Injection (₹)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            className="w-full bg-dark-bg/50 border border-primary/20 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all font-black text-xl text-primary placeholder:text-primary/20"
                            value={newAccount.initial_deposit}
                            onChange={(e) => setNewAccount({ ...newAccount, initial_deposit: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-3 pt-4">
                        <button
                            type="submit"
                            disabled={accLoading}
                            className="w-full bg-primary text-dark-bg py-5 rounded-2xl font-black text-xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3"
                        >
                            {accLoading ? (
                                <div className="w-7 h-7 border-4 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <ShieldCheck size={24} />
                                    <span>Authorize & Open Vault</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

