import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { fetchTasks } from "../../store/taskSlice";
import PageWrapper from "../../components/layout/PageWrapper";
import { FiTarget, FiClock, FiTrendingUp, FiCalendar, FiUser, FiAlertCircle } from "react-icons/fi";

export default function Dashboard() {
    const dispatch = useDispatch();
    const { user, isAuthenticated, mode } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            await dispatch(fetchTasks());
            setLoading(false);
        };
        loadTasks();
    }, [dispatch]);

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
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Loading user data...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    /* ---------------------------
       2️⃣ ROLE-BASED REDIRECT (TOP PRIORITY)
    ---------------------------- */

    if (user?.role === "Super Admin") {
        return <Navigate to="/admin" replace />;
    }

    /* ---------------------------
       3️⃣ PERSONAL MODE REDIRECT
    ---------------------------- */

    if (mode === "personal") {
        return <Navigate to="/dashboard/personal" replace />;
    }

    /* ---------------------------
       4️⃣ MEMBER DASHBOARD
    ---------------------------- */

    return <MemberDashboard loading={loading} />;
}

/* ===============================
   MEMBER DASHBOARD
================================ */

function MemberDashboard({ loading }) {
    const { tasks } = useSelector((state) => state.task);
    const { user, communities } = useSelector((state) => state.auth);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Get today at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Task statistics
    const assignedTasks = tasks.filter((t) => t.assignee === user?.id);
    const totalAssigned = assignedTasks.length;

    const overdueTasks = assignedTasks.filter((t) => {
        if (!t.due_date && !t.dueDate) return false;
        const dueDate = new Date(t.due_date || t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today && t.status !== 'done' && t.status !== 'Done';
    });

    const dueTodayTasks = assignedTasks.filter((t) => {
        if (!t.due_date && !t.dueDate) return false;
        const dueDate = new Date(t.due_date || t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime() && t.status !== 'done' && t.status !== 'Done';
    });

    const completedTasks = assignedTasks.filter((t) => t.status === 'done' || t.status === 'Done');
    const inProgressTasks = assignedTasks.filter((t) => t.status === 'inProgress' || t.status === 'In Progress');

    // Sprint statistics
    const activeSprints = new Set(
        tasks
            .filter(t => t.sprint && t.status !== 'done' && t.status !== 'Done')
            .map(t => t.sprint)
    ).size;

    // Community info
    const userCommunities = communities?.filter(c =>
        c.members?.some(m => m.id === user?.id) || c.member_ids?.includes(user?.id)
    ) || [];

    const completionRate = totalAssigned > 0
        ? Math.round((completedTasks.length / totalAssigned) * 100)
        : 0;

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header with Welcome Message */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Welcome back, <span className="text-indigo-600">{user?.name || 'Member'}</span>
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {currentTime.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                                    Role: {user?.role || 'Member'}
                                </span>
                                {userCommunities.length > 0 && (
                                    <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                                        {userCommunities.length} {userCommunities.length === 1 ? 'Community' : 'Communities'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Total Assigned */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <FiTarget className="text-indigo-600" size={20} />
                                </div>
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Assigned Tasks</p>
                            <p className="text-3xl font-bold text-gray-900">{totalAssigned}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {inProgressTasks.length} in progress
                            </p>
                        </div>

                        {/* In Progress */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FiClock className="text-blue-600" size={20} />
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    {completionRate}% Complete
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">In Progress</p>
                            <p className="text-3xl font-bold text-gray-900">{inProgressTasks.length}</p>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Due Today */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FiCalendar className="text-orange-600" size={20} />
                                </div>
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                    {dueTodayTasks.length > 0 ? 'Due today' : 'No due dates'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Due Today</p>
                            <p className="text-3xl font-bold text-gray-900">{dueTodayTasks.length}</p>
                            {dueTodayTasks.length > 0 && (
                                <p className="text-xs text-orange-600 mt-2 font-medium">
                                    Requires attention
                                </p>
                            )}
                        </div>

                        {/* Overdue */}
                        <div className={`bg-white rounded-lg shadow-sm p-5 border ${overdueTasks.length > 0 ? 'border-red-200' : 'border-gray-200'
                            } hover:shadow-md transition`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${overdueTasks.length > 0 ? 'bg-red-100' : 'bg-gray-100'
                                    } rounded-lg flex items-center justify-center`}>
                                    <FiAlertCircle className={overdueTasks.length > 0 ? 'text-red-600' : 'text-gray-600'} size={20} />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${overdueTasks.length > 0
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {overdueTasks.length > 0 ? 'Overdue' : 'All good'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Overdue Tasks</p>
                            <p className="text-3xl font-bold text-gray-900">{overdueTasks.length}</p>
                            {overdueTasks.length > 0 && (
                                <p className="text-xs text-red-600 mt-2 font-medium">
                                    Needs immediate attention
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Active Sprints */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FiTrendingUp className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Active Sprints</h3>
                                    <p className="text-xs text-gray-500">Sprints you're participating in</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-purple-600 mb-2">{activeSprints}</p>
                            <Link
                                to="/sprints"
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                            >
                                View all sprints →
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm p-5 text-white">
                            <h3 className="font-semibold mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/tasks?create=true"
                                    className="bg-white/20 backdrop-blur rounded-lg p-3 hover:bg-white/30 transition text-center"
                                >
                                    <span className="text-sm font-medium">New Task</span>
                                </Link>
                                <Link
                                    to="/sprints"
                                    className="bg-white/20 backdrop-blur rounded-lg p-3 hover:bg-white/30 transition text-center"
                                >
                                    <span className="text-sm font-medium">View Sprints</span>
                                </Link>
                                <Link
                                    to="/epics"
                                    className="bg-white/20 backdrop-blur rounded-lg p-3 hover:bg-white/30 transition text-center col-span-2"
                                >
                                    <span className="text-sm font-medium">Manage Epics</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Tasks */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                            <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                View all →
                            </Link>
                        </div>

                        {assignedTasks.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                                <FiTarget className="mx-auto text-3xl text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm mb-4">No tasks assigned to you yet</p>
                                <Link
                                    to="/tasks?create=true"
                                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                >
                                    Create your first task
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                                {assignedTasks.slice(0, 5).map((task) => {
                                    const dueDate = task.due_date || task.dueDate;
                                    const isOverdue = dueDate && new Date(dueDate) < today && task.status !== 'done';

                                    return (
                                        <Link
                                            key={task.id}
                                            to={`/tasks?task=${task.id}`}
                                            className="block p-4 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === 'done' ? 'bg-green-100 text-green-700' :
                                                                task.status === 'inProgress' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {task.status === 'inProgress' ? 'In Progress' :
                                                                task.status === 'done' ? 'Done' : 'To Do'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-1">{task.description}</p>
                                                </div>
                                                {dueDate && (
                                                    <div className={`text-xs whitespace-nowrap ml-4 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                                                        }`}>
                                                        {new Date(dueDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}