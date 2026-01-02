import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    FiPlus,
    FiUsers,
    FiZap,
    FiShield,
    FiSmartphone,
    FiArrowRight,
    FiStar,
    FiBarChart,
    FiMenu,
    FiX,
    FiCheckCircle,
    FiGlobe,
    FiLock,
    FiCalendar,
    FiMessageSquare,
    FiBell,
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
            {/* ===== HEADER ===== */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            A
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Assign Alert</h1>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition">Features</a>
                        <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition">How It Works</a>
                        <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition">Testimonials</a>
                        <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition">Pricing</a>
                    </nav>

                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition">Sign In</Link>
                        <Link
                            to="/signup"
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
                        >
                            Start Free
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2"
                    >
                        {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100">
                        <nav className="flex flex-col p-6 gap-4">
                            <a href="#features" className="text-gray-700 font-medium">Features</a>
                            <a href="#how-it-works" className="text-gray-700 font-medium">How It Works</a>
                            <a href="#testimonials" className="text-gray-700 font-medium">Testimonials</a>
                            <Link to="/signup" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-center">
                                Start Free
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* ===== HERO ===== */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center">
                    <span className="inline-block px-6 py-3 mb-6 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                        AI-Powered Corporate & Personal Productivity
                    </span>

                    <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
                        Assign Alert
                    </h1>

                    <p className="text-2xl lg:text-4xl text-gray-700 mb-10 max-w-5xl mx-auto">
                        AI-Powered Corporate Task, Sprint & Community Management System
                    </p>

                    <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                        One platform for work and life. Manage teams, branches, sprints, epics, and personal goals with intelligent AI insights.
                    </p>

                    {/* Community CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                        <Link
                            to="/signup"
                            className="group px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105 flex items-center justify-center gap-4"
                        >
                            <FiPlus className="text-2xl" />
                            Create Community
                        </Link>

                        <Link
                            to="/login"
                            className="group px-12 py-6 bg-white text-indigo-600 text-xl font-bold rounded-2xl border-4 border-indigo-600 hover:bg-indigo-50 shadow-2xl transition flex items-center justify-center gap-4"
                        >
                            <FiUsers className="text-2xl" />
                            Join Community
                        </Link>
                    </div>

                    <p className="text-gray-600 mb-8">
                        No credit card required • 14-day free trial
                    </p>
                </div>

                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30"></div>
            </section>

            {/* ===== VISUAL SHOWCASE ===== */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <h2 className="text-5xl font-black text-center mb-16">
                    Real Teams, Real Workflows
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition duration-500">
                        <img
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop"
                            alt="Diverse corporate team in modern office"
                            className="w-full h-96 object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-8">
                            <p className="text-white text-2xl font-bold">Collaborative Planning</p>
                        </div>
                    </div>

                    <div className="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition duration-500">
                        <img
                            src="https://static.vecteezy.com/system/resources/previews/048/685/797/original/kanban-board-with-team-hands-agile-software-development-process-project-management-system-cartoon-illustration-vector.jpg"
                            alt="Animated Kanban workflow with team"
                            className="w-full h-96 object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-8">
                            <p className="text-white text-2xl font-bold">Visual Task Management</p>
                        </div>
                    </div>

                    <div className="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition duration-500">
                        <img
                            src="https://img.freepik.com/premium-vector/project-management-concept-vector-illustration-business-team-working-together-with-project-data-dashboard-office_453374-40.jpg"
                            alt="Team analyzing data dashboard"
                            className="w-full h-96 object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-8">
                            <p className="text-white text-2xl font-bold">AI-Powered Insights</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center text-white">
                    {[
                        { label: 'Active Teams', value: '1200', suffix: '+' },
                        { label: 'Tasks Managed', value: '45000', suffix: '+' },
                        { label: 'Sprints Completed', value: '3200', suffix: '+' },
                        { label: 'Productivity Boost', value: '38', suffix: '%' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div
                                ref={(el) => (countersRef.current[i] = el)}
                                data-target={stat.value}
                                data-suffix={stat.suffix}
                                className="text-6xl font-extrabold mb-4"
                            >
                                0
                            </div>
                            <p className="text-xl opacity-90">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FEATURES GRID ===== */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-5xl font-black text-center mb-16">
                        Everything You Need in One Platform
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {/* Corporate Teams */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition">
                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-8">
                                <FiUsers className="text-4xl text-indigo-600" />
                            </div>
                            <h3 className="text-3xl font-bold mb-6">Corporate Teams</h3>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Hierarchical communities (branches, teams)</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Role-based access control</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Epics, Monthly & Weekly Sprints</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Kanban, Gantt, Calendar views</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Velocity & burndown tracking</li>
                            </ul>
                        </div>

                        {/* Personal Life */}
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-xl p-10 text-white hover:shadow-2xl transition">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                                <FiStar className="text-4xl" />
                            </div>
                            <h3 className="text-3xl font-bold mb-6">Personal Life</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3"><FiCheckCircle /> Private tasks separate from work</li>
                                <li className="flex items-center gap-3"><FiCheckCircle /> Health, Family, Learning categories</li>
                                <li className="flex items-center gap-3"><FiCheckCircle /> Daily focus & habit tracking</li>
                                <li className="flex items-center gap-3"><FiCheckCircle /> Simple todo & calendar</li>
                            </ul>
                        </div>

                        {/* AI Intelligence */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-8">
                                <FiZap className="text-4xl text-purple-600" />
                            </div>
                            <h3 className="text-3xl font-bold mb-6">AI Intelligence</h3>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Auto priority & category suggestions</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Deadline risk prediction</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Workload balancing</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Natural language task creation</li>
                            </ul>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8">
                                <FiShield className="text-4xl text-green-600" />
                            </div>
                            <h3 className="text-3xl font-bold mb-6">Enterprise Security</h3>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> JWT authentication</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Role-based access control</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Data isolation per community</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Full audit logs</li>
                            </ul>
                        </div>

                        {/* Views */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8">
                                <FiBarChart className="text-4xl text-blue-600" />
                            </div>
                            <h3 className="text-3xl font-bold mb-6">Multiple Views</h3>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Kanban Board</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> List & Calendar</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Interactive Gantt Chart</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Personal & Admin Dashboards</li>
                            </ul>
                        </div>

                        {/* Mobile */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition">
                            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-8">
                                <FiSmartphone className="text-4xl text-cyan-600" />
                            </div>
                            <h3 className="text-3xl font-bold mb-6">Mobile Ready</h3>
                            <p className="text-gray-600 mb-6">Coming soon: Native apps with voice creation</p>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Full offline sync</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Voice commands</li>
                                <li className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /> Push notifications</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-24 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-5xl font-black mb-12">Loved by Teams Worldwide</h2>
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12">
                        <p className="text-3xl italic mb-8 leading-relaxed">
                            "{testimonials[activeTestimonial].quote}"
                        </p>
                        <p className="font-bold text-xl">{testimonials[activeTestimonial].name}</p>
                        <p className="opacity-90">{testimonials[activeTestimonial].role}</p>
                    </div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-black mb-8">Start Building Better Habits Today</h2>
                    <p className="text-2xl text-gray-600 mb-12">
                        Join thousands of professionals already using Assign Alert
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/signup"
                            className="px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-gray-900 text-gray-400 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                    A
                                </div>
                                <h3 className="text-2xl font-bold text-white">Assign Alert</h3>
                            </div>
                            <p className="text-sm">AI-Powered Productivity for Work and Life</p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Product</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition">Features</a></li>
                                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center">
                        <p className="text-sm">© 2025 Assign Alert. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}