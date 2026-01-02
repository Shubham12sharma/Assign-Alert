import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiMail, FiLock, FiUser, FiBriefcase, FiUsers } from 'react-icons/fi';

export default function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: credentials, 2: organization choice
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        organizationName: '',
        inviteCode: '',
        choice: '', // 'create' or 'join'
    });

    const handleNext = () => {
        if (step === 1) {
            if (!form.name || !form.email || form.password.length < 8) {
                setError('Please fill all fields correctly');
                return;
            }
            setStep(2);
        } else {
            handleSignup();
        }
    };

    // If invite code in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('invite');
        if (code) {
            setForm({ ...form, inviteCode: code, choice: 'join' });
        }
    }, []);

    const handleSignup = async () => {
        setLoading(true);
        setError('');

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In real app: dispatch(registerUser(form))

            // Success → go to dashboard
            navigate('/dashboard', {
                state: {
                    message: form.choice === 'create'
                        ? `Welcome! Your organization "${form.organizationName}" is ready.`
                        : 'Welcome! You\'ve joined the team.'
                }
            });
        } catch (err) {
            setError('Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-gray-900 mb-4">Create Your Account</h1>
                    <p className="text-xl text-gray-600">Join thousands of productive teams</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-center mb-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            1
                        </div>
                        <div className="w-32 h-1 bg-gray-200 mx-4">
                            <div className={`h-full bg-indigo-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            2
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl mb-8 text-center font-medium">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Credentials */}
                    {step === 1 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    <FiUser className="inline mr-2" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition text-lg"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    <FiMail className="inline mr-2" /> Work Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition text-lg"
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    <FiLock className="inline mr-2" /> Password
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition text-lg"
                                    placeholder="••••••••"
                                />
                                <p className="text-sm text-gray-500 mt-2">Minimum 8 characters</p>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105 flex items-center justify-center gap-4"
                            >
                                Continue
                                <FiArrowRight className="text-2xl" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Organization Choice */}
                    {step === 2 && (
                        <div className="space-y-10">
                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                                How would you like to get started?
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Create Organization */}
                                <div
                                    onClick={() => setForm({ ...form, choice: 'create' })}
                                    className={`cursor-pointer rounded-3xl p-10 border-4 transition-all text-center ${form.choice === 'create'
                                            ? 'border-indigo-600 bg-indigo-50 shadow-2xl'
                                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-xl'
                                        }`}
                                >
                                    <FiBriefcase className="text-6xl text-indigo-600 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold mb-4">Create Organization</h3>
                                    <p className="text-gray-600 mb-6">
                                        Start fresh as Super Admin. Perfect for new companies or departments.
                                    </p>
                                    {form.choice === 'create' && (
                                        <input
                                            type="text"
                                            placeholder="Organization Name"
                                            value={form.organizationName}
                                            onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                                            className="w-full px-6 py-4 rounded-xl border border-indigo-300 focus:ring-4 focus:ring-indigo-200 mt-4 text-lg"
                                        />
                                    )}
                                    {form.choice === 'create' && <FiCheckCircle className="text-4xl text-indigo-600 mx-auto mt-6" />}
                                </div>

                                {/* Join Existing */}
                                <div
                                    onClick={() => setForm({ ...form, choice: 'join' })}
                                    className={`cursor-pointer rounded-3xl p-10 border-4 transition-all text-center ${form.choice === 'join'
                                            ? 'border-purple-600 bg-purple-50 shadow-2xl'
                                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-xl'
                                        }`}
                                >
                                    <FiUsers className="text-6xl text-purple-600 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold mb-4">Join Existing Team</h3>
                                    <p className="text-gray-600 mb-6">
                                        Use an invite code from your admin to join instantly.
                                    </p>
                                    {form.choice === 'join' && (
                                        <input
                                            type="text"
                                            placeholder="Enter Invite Code"
                                            value={form.inviteCode}
                                            onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
                                            className="w-full px-6 py-4 rounded-xl border border-purple-300 focus:ring-4 focus:ring-purple-200 mt-4 text-lg"
                                        />
                                    )}
                                    {form.choice === 'join' && <FiCheckCircle className="text-4xl text-purple-600 mx-auto mt-6" />}
                                </div>
                            </div>

                            <button
                                onClick={handleSignup}
                                disabled={loading || !form.choice || (form.choice === 'create' && !form.organizationName) || (form.choice === 'join' && !form.inviteCode)}
                                className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Complete Signup'}
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center mt-10 text-gray-600">
                    Already have an account? <Link to="/login" className="font-bold text-indigo-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}