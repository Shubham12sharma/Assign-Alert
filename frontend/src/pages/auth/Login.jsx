import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // TEMP login logic (replace with real auth later)
        setTimeout(() => {
            localStorage.setItem("token", "demo-token");
            setLoading(false);
            navigate("/dashboard");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="mt-2 text-gray-600">Sign in to your corporate account</p>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200 outline-none"
                                placeholder="john.doe@company.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200 outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm">
                                <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
                                <span className="ml-2 text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
                            Sign up
                        </Link>
                    </p>
                </div>

                <p className="mt-8 text-center text-xs text-gray-500">
                    © 2025 Your Company. All rights reserved.
                </p>
            </div>
        </div>
    );
}