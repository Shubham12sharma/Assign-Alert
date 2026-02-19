import PageWrapper from '../../components/layout/PageWrapper';
import { useSelector, useDispatch } from 'react-redux';
import { FiUsers, FiHome, FiSettings, FiShield, FiPlus, FiActivity, FiMail, FiUserPlus } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import InviteModal from '../../components/common/InviteModal';
import { fetchPendingInvites } from '../../store/inviteSlice';
import { fetchPersonalTasks } from '../../store/taskSlice';

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { currentCommunity } = useSelector((state) => state.community);
    const { pendingInvites } = useSelector((state) => state.invites || {});
    const { tasks } = useSelector((state) => state.task || {});
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                await Promise.all([
                    dispatch(fetchPersonalTasks()),
                    dispatch(fetchPendingInvites())
                ]);
            }
            setLoading(false);
        };
        loadData();
    }, [dispatch, user]);

    // Your existing calculations - keep them exactly as they are
    const totalUsers = user ? 1 : 0; // Your working calculation
    const totalCommunities = (user?.communities || []).length;
    const activeTasks = tasks ? tasks.filter(t =>
        t.status !== 'Done' && (t.assignee === user?.id || t.assignee === user?.mongo_id)
    ).length : 0;
    const pendingRequests = (pendingInvites || []).filter(inv =>
        inv.email === user?.email || (user?.communities || []).includes(inv.community)
    ).length;

    // Your existing activity feed - keep it exactly as is
    const recentActivities = (() => {
        if (!tasks) return [];

        const events = [];

        tasks.forEach((t) => {
            if (Array.isArray(t.activity_logs) && t.activity_logs.length > 0) {
                t.activity_logs.forEach((log) => {
                    events.push({
                        id: `${t.id}-${log.timestamp || Math.random()}`,
                        title: t.title,
                        message: log.action || 'Task updated',
                        timestamp: log.timestamp || t.created_at || t.due_date || new Date().toISOString(),
                    });
                });
            } else if (t.created_at) {
                events.push({
                    id: `${t.id}-created`,
                    title: t.title,
                    message: 'Task created',
                    timestamp: t.created_at,
                });
            }
        });

        return events
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    })();

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {user?.role === 'Super Admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage your <span className="font-medium text-indigo-600">{currentCommunity?.name || 'organization'}</span> and users
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <div className="flex-1 lg:flex-none">
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                                        <FiShield size={14} />
                                        {user?.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-colors"
                                >
                                    <FiPlus size={16} />
                                    Invite Members
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Total Users */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <FiUsers className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                Active in your communities
                            </div>
                        </div>

                        {/* Communities */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FiHome className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Communities</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalCommunities}</p>
                                </div>
                            </div>
                            {currentCommunity && (
                                <div className="text-xs text-gray-500">
                                    Current: <span className="font-medium">{currentCommunity.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Active Tasks */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FiActivity className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Active Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">{activeTasks}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                Assigned to you
                            </div>
                        </div>

                        {/* Pending Requests */}
                        <div className={`bg-white rounded-lg shadow-sm p-5 border ${pendingRequests > 0 ? 'border-orange-200' : 'border-gray-200'
                            } hover:shadow-md transition`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 ${pendingRequests > 0 ? 'bg-orange-100' : 'bg-gray-100'
                                    } rounded-lg flex items-center justify-center`}>
                                    <FiMail className={pendingRequests > 0 ? 'text-orange-600' : 'text-gray-600'} size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Pending Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                                </div>
                            </div>
                            {pendingRequests > 0 && (
                                <div className="text-xs text-orange-600 font-medium">
                                    Requires attention
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="w-full flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-left"
                                >
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                        <FiUserPlus className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">Invite New Members</p>
                                        <p className="text-xs text-gray-500">Add people to your community</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {/* Navigate to create community */ }}
                                    className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-left"
                                >
                                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                        <FiHome className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">Create New Community</p>
                                        <p className="text-xs text-gray-500">Start a new team space</p>
                                    </div>
                                </button>

                                {user?.role === 'Super Admin' && (
                                    <button
                                        onClick={() => {/* Navigate to roles management */ }}
                                        className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-left"
                                    >
                                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <FiShield className="text-white" size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">Manage Roles & Permissions</p>
                                            <p className="text-xs text-gray-500">Configure access levels</p>
                                        </div>
                                    </button>
                                )}

                                <button
                                    onClick={() => {/* Navigate to settings */ }}
                                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
                                >
                                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                                        <FiSettings className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">System Settings</p>
                                        <p className="text-xs text-gray-500">Configure global options</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

                            {recentActivities.length === 0 ? (
                                <div className="text-center py-8">
                                    <FiActivity className="mx-auto text-3xl text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No recent activity yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivities.map((item) => (
                                        <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {(item.title || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {item.message}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    "{item.title}"
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(item.timestamp).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Invite Modal */}
                    <InviteModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        communityId={currentCommunity?.mongo_id}
                    />
                </div>
            </div>
        </PageWrapper>
    );
}