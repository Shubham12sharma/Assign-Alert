import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, fetchCurrentUser } from "../../store/authSlice";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isAuthenticated } = useSelector(state => state.auth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await dispatch(
            loginUser({
                username: form.email,
                password: form.password,
            })
        );

        if (loginUser.fulfilled.match(result)) {
            dispatch(fetchCurrentUser());
        } else {
            setError(result.payload?.detail || "Invalid credentials");
        }

        setLoading(false);
    };

    // 🔑 AUTO REDIRECT AFTER LOGIN
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === "Super Admin" || user.role === "Admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                        Assign Alert
                    </h1>
                    <p className="text-xl text-gray-700">Welcome back! Sign in to continue</p>
                </div>

                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-7">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 text-lg"
                                placeholder="shubham@assignalert.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 text-lg"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl disabled:opacity-70"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-bold text-indigo-600 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}