import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell } from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import { setPersonalMode, setCorporateMode } from '../../store/authSlice';

export default function Topbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, mode } = useSelector(state => state.auth);

    const toggleMode = () => {
        if (mode === 'personal') {
            dispatch(setCorporateMode());
            navigate('/dashboard');
        } else {
            dispatch(setPersonalMode());
            navigate('/dashboard/personal');
        }
    };

    return (
        <div className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-50 shadow-sm">
            {/* Left: Search Bar */}
            <div className="flex items-center w-96">
                <div className="relative w-full max-w-md">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                        type="text"
                        placeholder="Search tasks, sprints, people, epics..."
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                </div>
            </div>

            {/* Right: Mode Toggle + Notifications + User */}
            <div className="flex items-center gap-6">
                {/* Mode Toggle */}
                <button
                    onClick={toggleMode}
                    className={`px-3 py-2 rounded-xl font-semibold transition shadow-sm ${mode === 'personal'
                            ? 'bg-purple-100 text-purple-700 border border-purple-300'
                            : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                        }`}
                >
                    {mode === 'personal' ? 'Personal Mode' : 'Corporate Mode'}
                </button>

                {/* Notifications */}
                <NotificationBell />

                {/* User Profile */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-500 capitalize">{user?.role || 'Member'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}