import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CreditCard, PieChart, Landmark, ArrowRight, Zap, Target } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-dark-bg text-white">
            {/* Animated Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center">

                {/* Hero Header */}
                <div className="flex flex-col items-center text-center space-y-8 max-w-4xl">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest animate-fade-in">
                        <Zap size={14} />
                        <span>Next Generation Banking</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none animate-fade-in">
                        Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Financial</span> Future.
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
                        Join Paytona for a smarter, faster, and more secure way to manage your wealth. Premium banking built for the modern digital era.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
                        <Link to="/register" className="group relative px-10 py-5 bg-primary text-dark-bg font-black rounded-2xl flex items-center space-x-2 overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                            <span>Get Started Now</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="px-10 py-5 border border-white/10 glass-card rounded-2xl font-black text-white hover:bg-white/5 transition-all duration-300">
                            Member Login
                        </Link>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mt-32">
                    <FeatureCard
                        icon={<Shield size={40} />}
                        title="Quantum Security"
                        desc="Your assets are protected by advanced bank-grade encryption protocols and multi-layer auth."
                    />
                    <FeatureCard
                        icon={<Target size={40} />}
                        title="Precision Wealth"
                        desc="Real-time tracking of your spending habits and detailed investment insights."
                    />
                    <FeatureCard
                        icon={<Landmark size={40} />}
                        title="Global Access"
                        desc="Manage your accounts and make transfers instantly from anywhere in the world."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="glass-card p-10 rounded-[2.5rem] flex flex-col items-start space-y-6 group hover:translate-y-[-10px] transition-all duration-500 border border-white/5">
            <div className="bg-primary/10 p-6 rounded-3xl text-primary group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <div className="space-y-3">
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
