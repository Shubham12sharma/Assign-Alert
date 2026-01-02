import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiUsers, FiClipboard, FiCalendar, FiTarget, FiSettings, FiLogOut } from 'react-icons/fi';
import { fetchCommunities, setCurrentCommunity } from '../../store/communitySlice';
import { logout } from '../../store/authSlice'; // ← Add this import

export default function Sidebar() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { communities, currentCommunity, loading } = useSelector((state) => state.community);

    useEffect(() => {
        if (communities.length === 0 && !loading) {
            dispatch(fetchCommunities());
        }
    }, [dispatch, communities.length, loading]);

    const handleCommunityClick = (community) => {
        dispatch(setCurrentCommunity(community));
    };

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login'; // Force redirect
    };

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg overflow-y-auto flex flex-col">
            {/* Top Section */}
            <div className="flex-1">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-indigo-600">Assign Alert</h1>
                    <p className="text-sm text-gray-500 mt-1">AI-Powered Productivity</p>
                </div>

                <nav className="p-4 space-y-6">
                    <Link
                        to="/dashboard"
                        className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                    >
                        <FiHome className="mr-3 text-lg" /> Dashboard
                    </Link>

                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Communities
                        </h3>
                        {loading ? (
                            <p className="text-sm text-gray-500 pl-2">Loading...</p>
                        ) : (
                            <ul className="space-y-1">
                                {communities.map((comm) => (
                                    <li key={comm.id}>
                                        <Link
                                            to={`/community/${comm.id}`}
                                            onClick={() => handleCommunityClick(comm)}
                                            className={`flex items-center p-3 rounded-lg transition font-medium ${currentCommunity?.id === comm.id
                                                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                                                    : 'text-gray-700 hover:bg-indigo-50'
                                                }`}
                                        >
                                            <FiUsers className="mr-3 text-lg" />
                                            <div className="flex-1">
                                                <div>{comm.name}</div>
                                                <div className="text-xs text-gray-500">{comm.memberCount} members</div>
                                            </div>
                                        </Link>

                                        {comm.subCommunities && comm.subCommunities.length > 0 && (
                                            <ul className="ml-10 mt-2 space-y-1">
                                                {comm.subCommunities.map((sub) => (
                                                    <li key={sub.id}>
                                                        <Link
                                                            to={`/community/${sub.id}`}
                                                            onClick={() => handleCommunityClick(sub)}
                                                            className={`flex items-center p-2 text-sm rounded transition ${currentCommunity?.id === sub.id
                                                                    ? 'text-indigo-700 font-medium'
                                                                    : 'text-gray-600 hover:text-gray-900'
                                                                }`}
                                                        >
                                                            ↳ {sub.name}
                                                            <span className="ml-auto text-xs text-gray-400">{sub.memberCount}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
                            + Create Community
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Link
                            to="/tasks"
                            className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                        >
                            <FiClipboard className="mr-3 text-lg" /> Tasks
                        </Link>

                        <Link
                            to="/sprints"
                            className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                        >
                            <FiCalendar className="mr-3 text-lg" /> Sprints
                        </Link>

                        <Link
                            to="/epics"
                            className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                        >
                            <FiTarget className="mr-3 text-lg" /> Epics
                        </Link>
                    </div>

                    {/* Admin Section */}
                    {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">
                                {user?.role === 'Super Admin' ? 'Super Admin' : 'Admin Tools'}
                            </h3>
                            {user?.role === 'Super Admin' && (
                                <>
                                    <Link to="/admin/users" className="flex items-center p-3 hover:bg-indigo-50 rounded-lg text-gray-700">
                                        <FiUsers className="mr-3" /> Manage Users
                                    </Link>
                                    <Link to="/admin/communities" className="flex items-center p-3 hover:bg-indigo-50 rounded-lg text-gray-700">
                                        <FiHome className="mr-3" /> Manage Communities
                                    </Link>
                                </>
                            )}
                            {user?.role === 'Admin' && (
                                <Link to="/admin/members" className="flex items-center p-3 hover:bg-indigo-50 rounded-lg text-gray-700">
                                    <FiUsers className="mr-3" /> Manage Team Members
                                </Link>
                            )}
                        </div>
                    )}
                </nav>
            </div>

            {/* Bottom Section - Settings & Logout */}
            <div className="p-4 border-t border-gray-200">
                <Link
                    to="/settings"
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium mb-2"
                >
                    <FiSettings className="mr-3 text-lg" /> Settings
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                >
                    <FiLogOut className="mr-3 text-lg" /> Logout
                </button>
            </div>
        </div>
    );
}