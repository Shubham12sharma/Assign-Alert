import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import SprintModal from '../../components/common/SprintModal';
import { fetchSprints, setCurrentSprint, deleteSprint } from '../../store/sprintSlice';
import { FiPlus, FiTarget, FiCalendar, FiTrendingUp, FiClock, FiTrash2, FiChevronRight } from 'react-icons/fi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

export default function SprintDashboard() {
    const dispatch = useDispatch();
    const { sprints, currentSprint, loading } = useSelector((state) => state.sprint);
    const { currentCommunity } = useSelector((state) => state.community);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (currentCommunity) {
            dispatch(fetchSprints({ community: currentCommunity }));
        }
    }, [dispatch, currentCommunity]);

    useEffect(() => {
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
        name: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
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

    const handleDeleteSprint = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Delete this sprint? This cannot be undone.')) return;
        dispatch(deleteSprint(id));
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500 animate-pulse flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Loading sprints...</span>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sprint Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage and track sprints in <span className="font-semibold text-indigo-600">
                                    {currentCommunity?.name || 'your team'}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <FiPlus size={16} />
                            Create Sprint
                        </button>
                    </div>

                    {/* Current Active Sprint */}
                    {activeSprint && (
                        <Link to={`/sprints/${activeSprint.id}`}>
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 mb-8 text-white hover:shadow-xl transition-all cursor-pointer">
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl font-bold">{activeSprint.name}</h2>
                                            <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                                                ACTIVE
                                            </span>
                                        </div>
                                        <p className="text-sm opacity-90 line-clamp-2">{activeSprint.goal}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs opacity-80">Sprint Period</p>
                                            <p className="text-sm font-semibold">
                                                {new Date(activeSprint.startDate).toLocaleDateString()} – {new Date(activeSprint.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <FiChevronRight size={20} className="opacity-60" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                    <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                        <p className="text-xs opacity-80 mb-1">Velocity</p>
                                        <p className="text-xl font-bold">{activeSprint.velocity || 48} pts</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                        <p className="text-xs opacity-80 mb-1">Progress</p>
                                        <p className="text-xl font-bold">{activeSprint.progress || 65}%</p>
                                        <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                                            <div
                                                className="bg-white h-1.5 rounded-full transition-all"
                                                style={{ width: `${activeSprint.progress || 65}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                        <p className="text-xs opacity-80 mb-1">Type</p>
                                        <p className="text-lg font-bold capitalize">{activeSprint.type || 'Monthly'}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                        <p className="text-xs opacity-80 mb-1">Status</p>
                                        <p className="text-lg font-bold">On Track</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* AI Insights */}
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">AI Sprint Insights</h3>
                                <p className="text-sm opacity-90">Workload balanced • No high-risk deadlines • Velocity stable</p>
                            </div>
                            <button className="bg-white text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm whitespace-nowrap">
                                Generate AI Report
                            </button>
                        </div>
                    </div>

                    {/* Velocity History */}
                    {completedSprintsWithVelocity.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                            <h2 className="text-lg font-semibold mb-4">Velocity History</h2>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Average</p>
                                    <p className="text-2xl font-bold text-indigo-600">{averageVelocity}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Highest</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {Math.max(...completedSprintsWithVelocity.map(s => s.velocity))}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Trend</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {completedSprintsWithVelocity.length >= 2
                                            ? completedSprintsWithVelocity[completedSprintsWithVelocity.length - 1].velocity >
                                                completedSprintsWithVelocity[completedSprintsWithVelocity.length - 2].velocity
                                                ? '↑' : '↓'
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={velocityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="velocity" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Upcoming Sprints */}
                    {upcomingSprints.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Upcoming Sprints</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {upcomingSprints.map((sprint) => (
                                    <Link
                                        key={sprint.id}
                                        to={`/sprints/${sprint.id}`}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all relative group"
                                    >
                                        <button
                                            onClick={(e) => handleDeleteSprint(sprint.id, e)}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Delete sprint"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                        <h4 className="font-medium text-gray-900 mb-1 pr-6">{sprint.name}</h4>
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{sprint.goal}</p>
                                        <div className="text-xs text-gray-500 mb-3">
                                            {new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}
                                        </div>
                                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                            PLANNED
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Sprints */}
                    {completedSprints.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Completed Sprints</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {completedSprints.map((sprint) => (
                                    <Link
                                        key={sprint.id}
                                        to={`/sprints/${sprint.id}`}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all relative group opacity-80 hover:opacity-100"
                                    >
                                        <button
                                            onClick={(e) => handleDeleteSprint(sprint.id, e)}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Delete sprint"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                        <h4 className="font-medium text-gray-900 mb-1 pr-6">{sprint.name}</h4>
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{sprint.goal}</p>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500">
                                                Completed {Math.round(sprint.progress || 100)}%
                                            </span>
                                            <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                DONE
                                            </span>
                                        </div>
                                        {sprint.retrospective && (
                                            <p className="text-[10px] text-gray-500 italic line-clamp-2">
                                                "{sprint.retrospective}"
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {sprints.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                            <FiCalendar className="mx-auto text-5xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No sprints yet</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                                Start planning your work by creating your first sprint
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-sm text-sm"
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
                </div>
            </div>
        </PageWrapper>
    );
}