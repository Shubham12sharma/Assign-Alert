import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCurrentUser } from "../store/authSlice";

export default function ProtectedRoute({ children, requiredRole = null }) {
    const dispatch = useDispatch();

    const token = localStorage.getItem("access_token");
    const { user, loading } = useSelector((state) => state.auth);

    // 🔴 No token → redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 🔁 Token exists but user not loaded → fetch user
    useEffect(() => {
        if (token && !user && !loading) {
            dispatch(fetchCurrentUser());
        }
    }, [token, user, loading, dispatch]);

    // ⏳ Block route until user is loaded
    if (!user) {
        return <div>Loading...</div>; // or spinner
    }

    // 🔐 Role-based access
    if (requiredRole) {
        if (user.role !== requiredRole && user.role !== "Super Admin") {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}
