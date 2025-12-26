import { useSelector } from 'react-redux';
import { FiSearch, FiBell, FiUser, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Topbar() {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center w-1/3">
                <div className="relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks, sprints, or members..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    <FiPlus className="mr-2" /> Create Task
                </button>
                <FiBell className="text-gray-600 cursor-pointer" /> {/* Notifications */}
                <div className="flex items-center space-x-2">
                    <FiUser className="text-gray-600" />
                    <span className="text-gray-700">{user.name}</span>
                    <span className="text-xs text-gray-500">({user.role})</span>
                </div>
            </div>
        </div>
    );
}