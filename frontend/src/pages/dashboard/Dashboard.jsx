import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { fetchTasks } from "../../store/taskSlice";
import PageWrapper from "../../components/layout/PageWrapper";

export default function Dashboard() {
    const dispatch = useDispatch();

    const { user, isAuthenticated, mode } = useSelector(
        (state) => state.auth
    );

    /* ---------------------------
       1️⃣ AUTH GUARD
    ---------------------------- */

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Token exists but /me not loaded yet
    if (!user) {
        return (
            <PageWrapper>
                <div className="p-6 text-center">Loading user...</div>
            </PageWrapper>
        );
    }

    /* ---------------------------
       2️⃣ ROLE-BASED REDIRECT (TOP PRIORITY)
    ---------------------------- */

    if (user.role === "Super Admin" || user.role === "Admin") {
        // Admin area lives at /admin (see AppRoutes)
        return <Navigate to="/admin" replace />;
    }

    /* ---------------------------
       3️⃣ PERSONAL MODE REDIRECT
    ---------------------------- */

    if (mode === "personal") {
        return <Navigate to="/dashboard/personal" replace />;
    }

    /* ---------------------------
       4️⃣ FETCH TASKS (MEMBER)
    ---------------------------- */

    useEffect(() => {
        dispatch(fetchTasks({ communityId: "all" }));
    }, [dispatch]);

    /* ---------------------------
       5️⃣ MEMBER DASHBOARD
    ---------------------------- */

    return <MemberDashboard />;
}

/* ===============================
   MEMBER DASHBOARD
================================ */

function MemberDashboard() {
    return (
        <PageWrapper>
            <h1 className="text-2xl font-bold mb-6">Personal Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Assigned Tasks</h3>
                    <p className="text-3xl font-bold text-indigo-600">12</p>
                    <p className="text-sm text-gray-500">3 overdue</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Active Sprints</h3>
                    <p className="text-3xl font-bold text-indigo-600">2</p>
                    <p className="text-sm text-gray-500">
                        Weekly Sprint Progress: 65%
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">AI Insights</h3>
                    <p className="text-sm">
                        Workload Balanced | No Deadline Risks
                    </p>
                    <button className="mt-2 text-indigo-600 hover:underline">
                        Generate Report
                    </button>
                </div>
            </div>
        </PageWrapper>
    );
}
