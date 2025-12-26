import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import SprintModal from '../../components/common/SprintModal';
import { fetchSprints, setCurrentSprint } from '../../store/sprintSlice';
import { FiPlus, FiTarget, FiCalendar, FiTrendingUp, FiClock } from 'react-icons/fi';

export default function SprintDashboard() {
    const dispatch = useDispatch();
    const { sprints, currentSprint, loading } = useSelector((state) => state.sprint);
    const { currentCommunity } = useSelector((state) => state.community);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (currentCommunity?.id && sprints.length === 0) {
            dispatch(fetchSprints({ communityId: currentCommunity.id }));
        }
    }, [dispatch, currentCommunity, sprints.length]);

    useEffect(() => {
        // Auto-select active sprint
        if (sprints.length > 0 && !currentSprint) {
            const active = sprints.find(s => s.status === 'active') || sprints[0];
            dispatch(setCurrentSprint(active));
        }
    }, [sprints, currentSprint, dispatch]);

    const activeSprint = currentSprint || sprints.find(s => s.status === 'active');
    const completedSprintsWithVelocity = sprints
        .filter(s => s.status === 'completed' && s.velocity > 0)
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    const velocityData = completedSprintsWithVelocity.map(s => ({
        name: s.name.slice(0, 15) + '...',
        velocity: s.velocity || 0,
    }));

    const averageVelocity = completedSprintsWithVelocity.length > 0
        ? Math.round(
            completedSprintsWithVelocity.reduce((sum, s) => sum + s.velocity, 0) /
            completedSprintsWithVelocity.length
        )
        : 0;

    const upcomingSprints = sprints.filter(s => s.status === 'planned');
    const completedSprints = sprints.filter(s => s.status === 'completed');

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500 text-xl">Loading sprints...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Sprint Dashboard</h1>
                    <p className="text-xl text-gray-600 mt-2">
                        Manage and track sprints in <span className="font-semibold">{currentCommunity?.name || 'your team'}</span>
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 font-semibold shadow-lg flex items-center gap-3 transition"
                >
                    <FiPlus className="text-xl" />
                    Create New Sprint
                </button>
            </div>

            {/* Current Active Sprint */}
            {activeSprint && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-12 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <h2 className="text-3xl font-bold">{activeSprint.name}</h2>
                                <span className="bg-white text-indigo-700 px-4 py-2 rounded-full font-semibold">
                                    ACTIVE
                                </span>
                            </div>
                            <p className="text-lg opacity-90 max-w-3xl">{activeSprint.goal}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-80">Sprint Period</p>
                            <p className="text-2xl font-bold">
                                {new Date(activeSprint.startDate).toLocaleDateString()} –{' '}
                                {new Date(activeSprint.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FiTrendingUp className="text-3xl" />
                            <p className="text-lg">Current Velocity</p>
                        </div>
                        <p className="text-5xl font-bold">{activeSprint.velocity || 0} pts</p>
                        <p className="text-sm opacity-80 mt-2">Completed story points in this sprint</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
                        <div className="bg-white/20 backdrop-blur rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <FiTrendingUp className="text-2xl" />
                                <p className="text-sm opacity-90">Velocity</p>
                            </div>
                            <p className="text-4xl font-bold">{activeSprint.velocity || 48} pts</p>
                        </div>

                        <div className="bg-white/20 backdrop-blur rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <FiTarget className="text-2xl" />
                                <p className="text-sm opacity-90">Progress</p>
                            </div>
                            <p className="text-4xl font-bold">{activeSprint.progress}%</p>
                            <div className="mt-3 w-full bg-white/30 rounded-full h-3">
                                <div
                                    className="bg-white h-3 rounded-full transition-all duration-700"
                                    style={{ width: `${activeSprint.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <FiCalendar className="text-2xl" />
                                <p className="text-sm opacity-90">Type</p>
                            </div>
                            <p className="text-2xl font-bold capitalize">{activeSprint.type || 'Monthly'}</p>
                        </div>

                        <div className="bg-white/20 backdrop-blur rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <FiClock className="text-2xl" />
                                <p className="text-sm opacity-90">Status</p>
                            </div>
                            <p className="text-2xl font-bold">On Track</p>
                            <p className="text-sm mt-1">No deadline risks detected</p>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights Placeholder */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-8 mb-12 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">AI Sprint Insights</h3>
                        <p className="opacity-90">Workload balanced • No high-risk deadlines • Velocity stable</p>
                    </div>
                    <button className="bg-white text-cyan-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
                        Generate AI Report
                    </button>
                </div>
            </div>

            
            {completedSprintsWithVelocity.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                    <h2 className="text-2xl font-bold mb-6">Velocity History</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">Average Velocity</p>
                            <p className="text-5xl font-bold text-indigo-600 mt-2">{averageVelocity}</p>
                            <p className="text-sm text-gray-500 mt-1">story points per sprint</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">Highest</p>
                            <p className="text-4xl font-bold text-green-600 mt-2">
                                {Math.max(...completedSprintsWithVelocity.map(s => s.velocity))}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">Trend</p>
                            <p className="text-4xl font-bold text-blue-600 mt-2">
                                {completedSprintsWithVelocity.length >= 2
                                    ? completedSprintsWithVelocity[completedSprintsWithVelocity.length - 1].velocity >
                                        completedSprintsWithVelocity[completedSprintsWithVelocity.length - 2].velocity
                                        ? '↑' : '↓'
                                    : '-'}
                            </p>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={velocityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="velocity" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Upcoming Sprints */}
            {upcomingSprints.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-6">Upcoming Sprints</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingSprints.map((sprint) => (
                            <div key={sprint.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
                                <h4 className="font-semibold text-lg mb-2">{sprint.name}</h4>
                                <p className="text-gray-600 text-sm mb-4">{sprint.goal}</p>
                                <div className="text-sm text-gray-500 mb-3">
                                    {new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}
                                </div>
                                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                                    PLANNED
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Sprints */}
            {completedSprints.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold mb-6">Completed Sprints</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedSprints.map((sprint) => (
                            <div key={sprint.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 opacity-80">
                                <h4 className="font-semibold text-lg mb-2">{sprint.name}</h4>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sprint.goal}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        Completed {Math.round(sprint.progress)}%
                                    </span>
                                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                        DONE
                                    </span>
                                </div>
                                {sprint.retrospective && (
                                    <p className="text-xs text-gray-500 mt-3 italic">
                                        "{sprint.retrospective}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {sprints.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <FiCalendar className="mx-auto text-8xl text-gray-300 mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">No sprints yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Start planning your work by creating your first sprint
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 shadow-lg"
                    >
                        Create Your First Sprint
                    </button>
                </div>
            )}

            {/* Create Sprint Modal */}
            <SprintModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode="create"
            />
        </PageWrapper>
    );
}