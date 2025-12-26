import PageWrapper from '../../components/layout/PageWrapper';
import { useSelector } from 'react-redux';
import { FiUsers, FiHome, FiSettings, FiShield } from 'react-icons/fi';

export default function AdminDashboard() {
    const { user } = useSelector((state) => state.auth);
    const { currentCommunity } = useSelector((state) => state.community);

    return (
        <PageWrapper>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">
                    {user?.role === 'Super Admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                </h1>
                <p className="text-xl text-gray-600 mt-3">
                    Manage your {currentCommunity?.name || 'organization'} and users
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <FiUsers className="text-2xl text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">156</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <FiHome className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Communities</p>
                            <p className="text-3xl font-bold text-gray-900">8</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <FiShield className="text-2xl text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Tasks</p>
                            <p className="text-3xl font-bold text-gray-900">342</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <FiSettings className="text-2xl text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending Requests</p>
                            <p className="text-3xl font-bold text-gray-900">12</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                    <div className="space-y-4">
                        <button className="w-full text-left p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition flex items-center gap-4">
                            <FiUsers className="text-xl text-indigo-600" />
                            <span className="font-medium">Invite New Members</span>
                        </button>
                        <button className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-xl transition flex items-center gap-4">
                            <FiHome className="text-xl text-green-600" />
                            <span className="font-medium">Create New Community</span>
                        </button>
                        {user?.role === 'Super Admin' && (
                            <button className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition flex items-center gap-4">
                                <FiShield className="text-xl text-purple-600" />
                                <span className="font-medium">Manage Roles & Permissions</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                JD
                            </div>
                            <div>
                                <p className="font-medium">John Doe created task "Fix login timeout"</p>
                                <p className="text-sm text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                JS
                            </div>
                            <div>
                                <p className="font-medium">Jane Smith joined Engineering Team</p>
                                <p className="text-sm text-gray-500">5 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}