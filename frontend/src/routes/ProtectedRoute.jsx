import { Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const token = localStorage.getItem('access_token');
    const user = useSelector(state => state.auth.user);

    // Not authenticated
    if (!token) return <Navigate to="/login" replace />;

    // If a role is required, ensure we have the user and the role matches
    if (requiredRole) {
        // If user info isn't loaded yet but token exists, allow the child
        // component to handle loading/fetching user instead of forcing a re-login.
        if (!user) return children;

        // Allow Super Admin to access everything, otherwise role must match
        if (user.role !== requiredRole && user.role !== 'Super Admin') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}
