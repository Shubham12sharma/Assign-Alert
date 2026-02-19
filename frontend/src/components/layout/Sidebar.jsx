import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiHome, FiUsers, FiClipboard, FiCalendar, FiTarget, FiSettings, FiLogOut, FiPlus
} from 'react-icons/fi';
import { fetchCommunities, setCurrentCommunity } from '../../store/communitySlice';
import { logout } from '../../store/authSlice';

export default function Sidebar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { communities, currentCommunity, loading } = useSelector((state) => state.community);

    // Fetch communities if not loaded yet
    useEffect(() => {
        if (communities.length === 0 && !loading) {
            dispatch(fetchCommunities());
        }
    }, [dispatch, communities.length, loading]);

    // Only show communities that the logged-in user belongs to.
    // Backend sends `user.communities` as a list of community names (StringRelatedField).
    const userCommunityNames = user?.communities || [];
    const visibleCommunities = communities.filter((community) =>
        userCommunityNames.includes(community.name)
    );

    // Auto-select first visible community if none is selected
    useEffect(() => {
        if (user && !currentCommunity && visibleCommunities.length > 0) {
            const firstCommunity = visibleCommunities[0];
            dispatch(setCurrentCommunity(firstCommunity.id));
            navigate(`/community/${firstCommunity.id}`, { replace: true });
        }
    }, [user, visibleCommunities, currentCommunity, dispatch, navigate]);

    const handleCommunityClick = (communityId) => {
        dispatch(setCurrentCommunity(communityId));
    };

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login';
    };

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 px-4 py-5 border-b border-gray-200">
                <h1 className="text-xl font-bold text-indigo-600">Assign Alert</h1>
                <p className="text-xs text-gray-500 mt-0.5">AI-Powered Productivity</p>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                {/* Dashboard Link */}
                <Link
                    to="/dashboard"
                    className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium text-sm mb-1"
                >
                    <FiHome className="mr-3 text-base" />
                    Dashboard
                </Link>

                {/* Communities Section */}
                <div className="mt-4">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Communities
                        </h3>
                        {user?.role === 'Super Admin' && (
                            <button
                                onClick={() => navigate('/admin/communities/create')}
                                className="text-indigo-600 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50"
                                title="Create Community"
                            >
                                <FiPlus size={14} />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-sm text-gray-500 px-3 py-2">Loading communities...</div>
                    ) : visibleCommunities.length === 0 ? (
                        <div className="text-sm text-gray-500 px-3 py-2">
                            {user?.role === 'Super Admin'
                                ? 'No communities created yet'
                                : "You're not a member of any community yet"}
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {visibleCommunities.map((parent) => (
                                <li key={parent.id}>
                                    <Link
                                        to={`/community/${parent.id}`}
                                        onClick={() => handleCommunityClick(parent.id)}
                                        className={`flex items-center px-3 py-2 rounded-lg transition text-sm ${currentCommunity === parent.id
                                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                                : 'text-gray-700 hover:bg-indigo-50'
                                            }`}
                                    >
                                        <FiUsers className="mr-3 text-base flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate">{parent.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {parent.member_count || 0} members
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Sub-communities */}
                                    {Array.isArray(parent.subCommunities) &&
                                        parent.subCommunities.length > 0 && (
                                            <ul className="mt-1 ml-8 space-y-1">
                                                {parent.subCommunities.map((child) => (
                                                    <li key={child.id}>
                                                        <Link
                                                            to={`/community/${child.id}`}
                                                            onClick={() => handleCommunityClick(child.id)}
                                                            className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition ${
                                                                currentCommunity === child.id
                                                                    ? 'bg-indigo-50 text-indigo-700'
                                                                    : 'text-gray-600 hover:bg-indigo-50'
                                                            }`}
                                                        >
                                                            <span className="w-1 h-1 rounded-full bg-indigo-400 mr-2 flex-shrink-0" />
                                                            <span className="flex-1 truncate">{child.name}</span>
                                                            <span className="text-[10px] text-gray-400 ml-2">
                                                                {child.member_count || 0}
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Other Features */}
                <div className="mt-6 space-y-1">
                    <Link
                        to="/tasks"
                        className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium text-sm"
                    >
                        <FiClipboard className="mr-3 text-base" />
                        Tasks
                    </Link>

                    <Link
                        to="/sprints"
                        className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium text-sm"
                    >
                        <FiCalendar className="mr-3 text-base" />
                        Sprints
                    </Link>

                    <Link
                        to="/epics"
                        className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium text-sm"
                    >
                        <FiTarget className="mr-3 text-base" />
                        Epics
                    </Link>
                </div>

                {/* Admin Tools – visible only to Super Admin */}
                {user?.role === 'Super Admin' && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                            Admin Tools
                        </h3>

                        <div className="space-y-1">
                            <Link
                                to="/admin/users"
                                className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-indigo-50 rounded-lg transition text-sm"
                            >
                                <FiUsers className="mr-3 text-base" />
                                Manage Users
                            </Link>
                            <Link
                                to="/admin/communities"
                                className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-indigo-50 rounded-lg transition text-sm"
                            >
                                <FiHome className="mr-3 text-base" />
                                Manage Communities
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Section - Fixed */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
                <Link
                    to="/settings"
                    className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm mb-1"
                >
                    <FiSettings className="mr-3 text-base" />
                    Settings
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                >
                    <FiLogOut className="mr-3 text-base" />
                    Logout
                </button>
            </div>
        </div>
    );
}