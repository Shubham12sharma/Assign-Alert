import { useState } from "react";
import { useDispatch } from "react-redux"; // ← Add this
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../store/authSlice"; // ← Add import

export default function Login() {
    const dispatch = useDispatch(); // ← Add this
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // ← FIXED: Add error state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous error
        setLoading(true);

        const result = await dispatch(loginUser({ email: form.email }));

        if (loginUser.fulfilled.match(result)) {
            const user = result.payload;
            // Super Admin or Admin go to /admin, others to /dashboard
            if (user.role === 'Super Admin' || user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.payload || 'Invalid email. Try shubham@assignalert.com');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-indigo-900">Assign Alert</h1>
                    <p className="mt-4 text-xl text-gray-700">Welcome back! Sign in to continue</p>
                </div>

                <div className="bg-white shadow-2xl rounded-3xl p-10 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition"
                                placeholder="shubham@assignalert.com"
                            />
                        </div>

                        {/* Password field kept but not used (for future real auth) */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password 
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 transition"
                                placeholder="Any password works"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 px-5 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg transition duration-200"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
                            Sign up
                        </Link>
                    </p>

                    {/* <div className="mt-8 text-center text-xs text-gray-500">
                        <p className="font-medium mb-2">Test Accounts:</p>
                        <p>Super Admin: shubham@assignalert.com</p>
                        <p>Admin: jane@mumbai.assignalert.com</p>
                        <p>Member: john@engineering.assignalert.com</p>
                        <p>Guest: guest@example.com</p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}