import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Basic validation
        if (!form.name.trim()) {
            setError('Please enter your full name');
            return;
        }
        if (!form.email.trim() || !form.email.includes('@')) {
            setError('Please enter a valid work email');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            // TEMP: Mock signup – replace with real API later
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate success
            setSuccess(true);
            setTimeout(() => {
                navigate("/login", {
                    state: { message: "Account created successfully! Please sign in." }
                });
            }, 1500);
        } catch (err) {
            setError('Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-indigo-900 mb-4">Assign Alert</h1>
                    <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
                    <p className="mt-3 text-lg text-gray-600">
                        Join your organization's workspace
                    </p>
                </div>

                <div className="bg-white shadow-2xl rounded-3xl p-10 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Work Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Work Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition"
                                placeholder="john.doe@company.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition"
                                placeholder="••••••••"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-700 px-5 py-4 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 text-green-700 px-5 py-4 rounded-xl text-sm font-medium">
                                Account created successfully! Redirecting to login...
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-5 rounded-xl shadow-lg transition duration-200 transform hover:scale-105"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                            Sign in
                        </Link>
                    </p>

                    <div className="mt-10 pt-8 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>

                <p className="mt-10 text-center text-xs text-gray-500">
                    © 2025 Assign Alert. All rights reserved.
                </p>
            </div>
        </div>
    );
}