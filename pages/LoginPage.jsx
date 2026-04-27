import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Landmark, ArrowRight, User as UserIcon, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [isCustomer, setIsCustomer] = useState(true);
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isCustomer ? '/auth/login' : '/admin/login';
            const payload = isCustomer ? { email: emailOrUsername, password } : { username: emailOrUsername, password };

            const res = await api.post(endpoint, payload);
            login(res.data.user, res.data.token);
            toast.success('Access Granted');
            navigate(isCustomer ? '/dashboard' : '/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden glass-card rounded-[3rem] border border-white/10">

                {/* Left Side: Info/Decoration */}
                <div className="hidden md:flex md:w-5/12 emerald-gradient p-12 flex-col justify-between text-dark-bg">
                    <div className="flex items-center space-x-2 font-black text-2xl tracking-[0.3em]">
                        <Landmark size={32} />
                        <span>PAYTONA</span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl font-black leading-tight">Secure Portal Access</h2>
                        <p className="font-medium opacity-80">Login to manage your premium accounts, verify transactions, and explore your financial growth.</p>
                    </div>

                    <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-dark-bg"></div>
                        <div className="w-8 h-2 rounded-full bg-dark-bg opacity-30"></div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-grow p-10 md:p-14 bg-dark-surface/50">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
                            <p className="text-gray-400 font-medium text-sm">Choose your account type to proceed</p>
                        </div>

                        <div className="flex bg-white/5 p-1 rounded-2xl w-fit">
                            <button
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isCustomer ? 'bg-primary text-dark-bg shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setIsCustomer(true)}
                                type="button"
                            >
                                Customer
                            </button>
                            <button
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${!isCustomer ? 'bg-primary text-dark-bg shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setIsCustomer(false)}
                                type="button"
                            >
                                Admin
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                                    {isCustomer ? 'Email Account' : 'Internal Username'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        {isCustomer ? <Mail size={18} /> : <UserIcon size={18} />}
                                    </div>
                                    <input
                                        type={isCustomer ? "email" : "text"}
                                        required
                                        className="w-full bg-white/5 border border-white/10 px-11 py-4 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-gray-600"
                                        value={emailOrUsername}
                                        onChange={(e) => setEmailOrUsername(e.target.value)}
                                        placeholder={isCustomer ? "name@domain.com" : "admin_id"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Secure Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white/5 border border-white/10 px-11 py-4 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-gray-600"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-dark-bg py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Vault Entry</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        {isCustomer && (
                            <p className="text-center text-gray-500 font-medium">
                                Don't have an account? <Link to="/register" className="text-primary hover:underline">Apply Now</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
