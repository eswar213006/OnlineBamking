import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Landmark, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden glass-card rounded-[3rem] border border-white/10">

                {/* Left side: branding/info */}
                <div className="hidden md:flex md:w-5/12 emerald-gradient p-12 flex-col justify-between text-dark-bg">
                    <div className="flex items-center space-x-2 font-black text-2xl tracking-[0.3em]">
                        <Landmark size={32} />
                        <span>PAYTONA</span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl font-black leading-tight">Start Your Premium Journey</h2>
                        <p className="font-medium opacity-80">Open an account in minutes and experience the future of digital banking. Secure, fast, and built for you.</p>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center space-x-3 bg-dark-bg/10 p-4 rounded-2xl">
                                <ShieldCheck className="text-dark-bg" />
                                <span className="text-sm font-bold tracking-tight">Zero-Knowledge Encryption</span>
                            </div>
                            <div className="flex items-center space-x-3 bg-dark-bg/10 p-4 rounded-2xl">
                                <MapPin className="text-dark-bg" />
                                <span className="text-sm font-bold tracking-tight">Global Branch Network</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">© 2026 Infinity Banking Group</p>
                </div>

                {/* Right side: Form */}
                <div className="flex-grow p-10 md:p-14 bg-dark-surface/50">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black mb-2">Create Account</h2>
                            <p className="text-gray-400 font-medium text-sm">Join thousands of elite members today</p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Legal Name</label>
                                <InputWrapper icon={<User size={18} />}>
                                    <input type="text" name="name" required placeholder="John Doe" onChange={handleChange} />
                                </InputWrapper>
                            </div>

                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                                <InputWrapper icon={<Mail size={18} />}>
                                    <input type="email" name="email" required placeholder="name@domain.com" onChange={handleChange} />
                                </InputWrapper>
                            </div>

                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Mobile Number</label>
                                <InputWrapper icon={<Phone size={18} />}>
                                    <input type="tel" name="phone" required placeholder="+91 98765 43210" onChange={handleChange} />
                                </InputWrapper>
                            </div>

                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Secure Password</label>
                                <InputWrapper icon={<Lock size={18} />}>
                                    <input type="password" name="password" required placeholder="••••••••••••" onChange={handleChange} />
                                </InputWrapper>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Postal Address</label>
                                <InputWrapper icon={<MapPin size={18} />}>
                                    <textarea name="address" rows="2" className="pt-3" placeholder="Street, City, Zip Code" onChange={handleChange}></textarea>
                                </InputWrapper>
                            </div>

                            <div className="col-span-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-dark-bg py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>Authorize Membership</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <p className="text-center text-gray-500 font-medium">
                            Already a member? <Link to="/login" className="text-primary hover:underline">Vault Access</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputWrapper({ children, icon }) {
    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                {icon}
            </div>
            {React.cloneElement(children, {
                className: `w-full bg-white/5 border border-white/10 px-11 py-4 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-gray-600 ${children.props.className || ''}`
            })}
        </div>
    );
}

function ShieldCheck(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
