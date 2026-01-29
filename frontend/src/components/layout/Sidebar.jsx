import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiHome, FiUsers, FiClipboard, FiCalendar, FiTarget, FiSettings, FiLogOut
} from 'react-icons/fi';
import { fetchCommunities, setCurrentCommunity } from '../../store/communitySlice';
import { logout } from '../../store/authSlice';

export default function Sidebar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { communities, currentCommunity, loading } = useSelector((state) => state.community);

    // Get user's community names from auth state (from login response)
    const userCommunityNames = user?.communities || [];

    // Only show communities that the logged-in user is a member of
    const displayedCommunities = communities.filter(community =>
        userCommunityNames.includes(community.name)
    );

    // Debug logs (remove in production)
    useEffect(() => {
        console.log('Sidebar rendered — all communities from API:', communities);
        console.log('User belongs to communities:', userCommunityNames);
        console.log('Displayed (filtered) communities:', displayedCommunities);
    }, [communities, userCommunityNames, displayedCommunities]);

    // Fetch communities if not loaded yet
    useEffect(() => {
        if (communities.length === 0 && !loading) {
            dispatch(fetchCommunities());
        }
    }, [dispatch, communities.length, loading]);

    // Auto-select first community if there's only one and none is selected
    useEffect(() => {
        if (
            user &&
            displayedCommunities.length === 1 &&
            !currentCommunity
        ) {
            const firstCommunity = displayedCommunities[0];
            dispatch(setCurrentCommunity(firstCommunity.id));
            navigate(`/community/${firstCommunity.id}`, { replace: true });
        }
    }, [user, displayedCommunities, currentCommunity, dispatch, navigate]);

    const handleCommunityClick = (communityId) => {
        dispatch(setCurrentCommunity(communityId));
    };

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login'; // Force redirect
    };

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-indigo-600">Assign Alert</h1>
                <p className="text-sm text-gray-500 mt-1">AI-Powered Productivity</p>
            </div>

            {/* Main Navigation */}
            <nav className="p-4 space-y-6 flex-1">
                <Link
                    to="/dashboard"
                    className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                >
                    <FiHome className="mr-3 text-lg" />
                    Dashboard
                </Link>

                {/* Communities Section */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Communities
                    </h3>

                    {loading ? (
                        <p className="text-sm text-gray-500 pl-2">Loading communities...</p>
                    ) : displayedCommunities.length === 0 ? (
                        <p className="text-sm text-gray-500 pl-2">
                            {userCommunityNames.length === 0 ? "You're not a member of any community yet" : "No matching communities"}
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {displayedCommunities.map((comm) => (
                                <li key={comm.id}>
                                    <Link
                                        to={`/community/${comm.id}`}
                                        onClick={() => handleCommunityClick(comm.id)}
                                        className={`flex items-center p-3 rounded-lg transition font-medium ${currentCommunity === comm.id
                                                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                                                : 'text-gray-700 hover:bg-indigo-50'
                                            }`}
                                    >
                                        <FiUsers className="mr-3 text-lg" />
                                        <div className="flex-1">
                                            <div className="font-medium">{comm.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {comm.member_count} members
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Create community button */}
                    <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
                        + Create Community
                    </button>
                </div>

                {/* Other Features */}
                <div className="space-y-2">
                    <Link
                        to="/tasks"
                        className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                    >
                        <FiClipboard className="mr-3 text-lg" />
                        Tasks
                    </Link>

                    <Link
                        to="/sprints"
                        className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                    >
                        <FiCalendar className="mr-3 text-lg" />
                        Sprints
                    </Link>

                    <Link
                        to="/epics"
                        className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition font-medium"
                    >
                        <FiTarget className="mr-3 text-lg" />
                        Epics
                    </Link>
                </div>

                {/* Admin Tools */}
                {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">
                            {user?.role === 'Super Admin' ? 'Super Admin' : 'Admin Tools'}
                        </h3>

                        {user?.role === 'Super Admin' && (
                            <>
                                <Link
                                    to="/admin/users"
                                    className="flex items-center p-3 hover:bg-indigo-50 rounded-lg text-gray-700"
                                >
                                    <FiUsers className="mr-3" />
                                    Manage Users
                                </Link>
                                <Link
                                    to="/admin/communities"
                                    className="flex items-center p-3 hover:bg-indigo-50 rounded-lg text-gray-700"
                                >
                                    <FiHome className="mr-3" />
                                    Manage Communities
                                </Link>
                            </>
                        )}

                        {user?.role === 'Admin' && (
                            <Link
                                to="/admin/members"
                                className="flex items-center p-3 hover:bg-indigo-50 rounded-lg text-gray-700"
                            >
                                <FiUsers className="mr-3" />
                                Manage Team Members
                            </Link>
                        )}
                    </div>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-200">
                <Link
                    to="/settings"
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium mb-2"
                >
                    <FiSettings className="mr-3 text-lg" />
                    Settings
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                >
                    <FiLogOut className="mr-3 text-lg" />
                    Logout
                </button>
            </div>
        </div>
    );
}