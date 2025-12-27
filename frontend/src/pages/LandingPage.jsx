import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    FiCheckCircle,
    FiUsers,
    FiZap,
    FiShield,
    FiSmartphone,
    FiArrowRight,
    FiStar,
    FiBarChart,
    FiMenu,
    FiX,
    FiPlay,
} from 'react-icons/fi';

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const countersRef = useRef([]);
    const [started, setStarted] = useState(false);

    const testimonials = [
        {
            name: 'Amit Verma',
            role: 'Product Manager at TechCorp',
            quote: 'Assign Alert completely transformed how we manage sprints and deadlines across distributed teams.',
            
        },
        {
            name: 'Sneha Patel',
            role: 'Founder, StartupX',
            quote: 'The unified workspace for work and personal goals changed everything. No more context switching.',
           
        },
        {
            name: 'Rahul Mehta',
            role: 'Engineering Lead',
            quote: 'AI-powered insights saved us hours weekly. The velocity tracking is incredibly accurate.',
            
        },
    ];

    const features = [
        {
            icon: <FiZap className="w-8 h-8" />,
            title: 'Smart Task Management',
            desc: 'AI-powered prioritization that learns your team\'s workflow and suggests optimal task assignments.'
        },
        {
            icon: <FiUsers className="w-8 h-8" />,
            title: 'Team Collaboration',
            desc: 'Real-time updates, comments, and file sharing all in one unified workspace.'
        },
        {
            icon: <FiBarChart className="w-8 h-8" />,
            title: 'Analytics & Insights',
            desc: 'Data-driven dashboards that track productivity, velocity, and team performance metrics.'
        },
        {
            icon: <FiShield className="w-8 h-8" />,
            title: 'Enterprise Security',
            desc: 'Bank-level encryption, SSO, and compliance with GDPR, SOC 2, and HIPAA standards.'
        },
        {
            icon: <FiSmartphone className="w-8 h-8" />,
            title: 'Mobile-First Design',
            desc: 'Manage everything on the go with our fully-featured iOS and Android apps.'
        },
        {
            icon: <FiCheckCircle className="w-8 h-8" />,
            title: 'Automation',
            desc: 'Automate repetitive tasks and workflows to focus on high-impact work.'
        },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setStarted(true);
                    countersRef.current.forEach((el) => {
                        if (!el) return;
                        const target = +el.dataset.target;
                        let count = 0;
                        const inc = Math.ceil(target / 60);
                        const timer = setInterval(() => {
                            count += inc;
                            if (count >= target) {
                                el.innerText = target + (el.dataset.suffix || '');
                                clearInterval(timer);
                            } else {
                                el.innerText = count + (el.dataset.suffix || '');
                            }
                        }, 30);
                    });
                }
            },
            { threshold: 0.5 }
        );

        if (countersRef.current[0]) observer.observe(countersRef.current[0]);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes glow {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                @keyframes slideInDown {
                    from { transform: translateY(-100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideInUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-glow { animation: glow 3s ease-in-out infinite; }
                .animate-slide-down { animation: slideInDown 0.8s ease-out; }
                .animate-slide-up { animation: slideInUp 0.8s ease-out; }
                .animate-fade { animation: fadeIn 0.8s ease-out; }
                .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            `}</style>

            {/* ===== HEADER ===== */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-bold text-2xl gradient-text">
                        Assign Alert
                    </div>

                    <nav className="hidden lg:flex items-center gap-10">
                        <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">How It Works</a>
                        <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Testimonials</a>
                        <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Pricing</a>
                    </nav>

                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Sign In</Link>
                        <Link to="/signup" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition">
                            Start Free
                        </Link>
                    </div>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
                        {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100">
                        <nav className="flex flex-col p-6 gap-4">
                            <a href="#features" className="text-gray-600 font-medium">Features</a>
                            <a href="#how-it-works" className="text-gray-600 font-medium">How It Works</a>
                            <a href="#testimonials" className="text-gray-600 font-medium">Testimonials</a>
                            <Link to="/signup" className="w-full px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg">Start Free</Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* ===== HERO ===== */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-40"></div>
                <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-40"></div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="animate-slide-down">
                        <div className="inline-block mb-6">
                            <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-200">
                                ✨ Trusted by 1000+ teams
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
                            Manage Work & Life, <span className="gradient-text">Effortlessly</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                            One unified platform for epics, sprints, tasks, and personal goals. Powered by AI that learns your workflow.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link to="/signup" className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg text-lg shadow-2xl hover:shadow-3xl transition transform hover:scale-105 flex items-center justify-center gap-3">
                                    Start Free Trial
                                    <FiArrowRight className="group-hover:translate-x-1 transition" />
                                </Link>
                            <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-lg text-lg border-2 border-gray-200 hover:border-gray-900 transition flex items-center justify-center gap-3">
                                        <FiPlay className="w-5 h-5" />
                                        Watch Demo
                                    </button>
                        </div>

                        <p className="text-gray-500 mb-16">No credit card required • 14-day free trial • Cancel anytime</p>
                    </div>

                    {/* Hero Image */}
                    <div className="animate-float">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop"
                                alt="Dashboard"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-10 text-8xl font-bold text-white opacity-5">📊</div>
                    <div className="absolute bottom-0 right-10 text-8xl font-bold text-white opacity-5">⚡</div>
                </div>
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center text-white relative z-10">
                    {[
                        { label: 'Active Teams', value: '1200', suffix: '+' },
                        { label: 'Tasks Managed', value: '450', suffix: 'K+' },
                        { label: 'Uptime', value: '99.9', suffix: '%' },
                        { label: 'Avg. Time Saved', value: '8', suffix: 'hrs/week' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div ref={(el) => (countersRef.current[i] = el)} data-target={stat.value} data-suffix={stat.suffix} className="text-5xl md:text-6xl font-black mb-2">0</div>
                            <p className="text-sm opacity-90 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FEATURES GRID ===== */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Everything you need to <span className="gradient-text">scale</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Comprehensive tools designed to help teams work smarter, not harder.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="group p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition duration-300 bg-gradient-to-br from-white to-gray-50">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== VISUAL SHOWCASE ===== */}
            <section id="how-it-works" className="py-24 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-5xl md:text-6xl font-black text-center mb-20">
                        See it in action
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Team Collaboration', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',  },
                            { title: 'Visual Workflows', img: 'https://vksapp.com/_next/image?url=https%3A%2F%2Fstrapi.vksapp.com%2Fuploads%2FVisual_Work_Instructions_4bf760cdf7.jpg&w=2400&q=75', },
                            { title: 'Smart Analytics', img: 'https://www.tibco.com/blog/wp-content/uploads/2015/02/45968386_thumbnail1.jpg',},
                        ].map((item, i) => (
                            <div key={i} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-500">
                                <img src={item.img} alt={item.title} className="w-full h-64 object-cover group-hover:scale-110 transition duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500">
                                    <span className="text-5xl mb-3">{item.icon}</span>
                                    <p className="text-white text-2xl font-bold">{item.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section id="testimonials" className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-black mb-6">Loved by teams everywhere</h2>
                        <p className="text-xl text-gray-600">Join thousands of organizations that are transforming their workflow.</p>
                    </div>

                    <div className="relative h-80 md:h-64">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 transition-all duration-700 ${i === activeTestimonial ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                    }`}
                            >
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-12 h-full flex flex-col justify-center">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="text-5xl">{t.avatar}</div>
                                        <div>
                                            <h4 className="font-bold text-lg">{t.name}</h4>
                                            <p className="text-gray-600 text-sm">{t.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-xl text-gray-900 leading-relaxed italic">"{t.quote}"</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTestimonial(i)}
                                className={`w-3 h-3 rounded-full transition ${i === activeTestimonial ? 'bg-indigo-600 w-8' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 text-9xl font-black text-white">→</div>
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8">Ready to transform your workflow?</h2>
                    <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">Join thousands of teams already using Assign Alert to work smarter.</p>
                    <Link to="/signup" className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-lg text-lg hover:shadow-2xl transition transform hover:scale-105">
                        Start Your Free Trial
                    </Link>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-gray-900 text-gray-400 py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="font-black text-2xl gradient-text mb-4">Assign Alert</div>
                            <p className="text-sm">AI-powered productivity for work and life.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm">PRODUCT</h4>
                            <ul className="space-y-3 text-sm"><li><a href="#" className="hover:text-white">Features</a></li><li><a href="#" className="hover:text-white">Pricing</a></li><li><a href="#" className="hover:text-white">Security</a></li></ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm">COMPANY</h4>
                            <ul className="space-y-3 text-sm"><li><a href="#" className="hover:text-white">About</a></li><li><a href="#" className="hover:text-white">Blog</a></li><li><a href="#" className="hover:text-white">Careers</a></li></ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm">LEGAL</h4>
                            <ul className="space-y-3 text-sm"><li><a href="#" className="hover:text-white">Privacy</a></li><li><a href="#" className="hover:text-white">Terms</a></li><li><a href="#" className="hover:text-white">Cookies</a></li></ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2025 Assign Alert. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}