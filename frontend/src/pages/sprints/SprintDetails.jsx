import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import SprintModal from '../../components/common/SprintModal';
import TaskBoard from '../tasks/TaskBoard';
import { setCurrentSprint, fetchSprints, deleteSprint } from '../../store/sprintSlice';
import { FiEdit2, FiTarget, FiTrendingUp, FiCalendar, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function SprintDetails() {
    const { sprintId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sprints, currentSprint, loading } = useSelector((state) => state.sprint);
    const { tasks } = useSelector((state) => state.task);
    const { currentCommunity } = useSelector((state) => state.community);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const sprint = sprints.find((s) => s.id === sprintId);

    useEffect(() => {
        if (currentCommunity) {
            dispatch(fetchSprints({ community: currentCommunity }));
        }
    }, [dispatch, currentCommunity]);

    useEffect(() => {
        if (sprint && (!currentSprint || currentSprint.id !== sprint.id)) {
            dispatch(setCurrentSprint(sprint));
        }
    }, [sprint, currentSprint, dispatch]);

    const handleDelete = async () => {
        if (!window.confirm('Delete this sprint? This cannot be undone.')) return;
        const res = await dispatch(deleteSprint(sprint.id));
        if (!res.error) {
            navigate('/sprints', { replace: true });
        }
    };

    if (loading || !sprint) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500 animate-pulse flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Loading sprint details...</span>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // Burndown Data
    const totalPoints = 60;
    const daysInSprint = Math.ceil(
        (new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)
    ) || 14;

    const burndownData = [];
    for (let i = 0; i <= daysInSprint; i++) {
        const date = new Date(sprint.startDate);
        date.setDate(date.getDate() + i);
        const ideal = Math.max(0, totalPoints - (totalPoints / daysInSprint) * i);
        const actual = Math.max(0, totalPoints - (sprint.progress / 100) * totalPoints * (i / daysInSprint));
        burndownData.push({
            day: i,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ideal: Math.round(ideal),
            actual: Math.round(actual),
        });
    }

    // Sprint Tasks
    const sprintTasks = tasks.filter(
        (task) => task.sprint === sprint.id || task.sprintId === sprint.id
    );

    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (sprint.progress / 100) * circumference;

    return (
        <PageWrapper>
            <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Back & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <Link
                            to="/sprints"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            <FiArrowLeft size={16} />
                            Back to Sprint Dashboard
                        </Link>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm"
                            >
                                <FiEdit2 size={14} />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium text-sm border border-red-100"
                            >
                                <FiTrash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Sprint Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white mb-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-2xl font-bold">{sprint.name}</h1>
                                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                                        {sprint.status?.toUpperCase() || 'ACTIVE'}
                                    </span>
                                </div>
                                <p className="text-sm opacity-90 max-w-3xl">{sprint.goal}</p>
                            </div>
                            <div className="text-left lg:text-right">
                                <p className="text-xs opacity-80 mb-1">Sprint Period</p>
                                <p className="text-sm font-semibold">
                                    {new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs opacity-80 mt-1 capitalize">{sprint.type || 'Monthly'} Sprint</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiTrendingUp size={14} className="opacity-80" />
                                    <p className="text-xs opacity-80">Velocity</p>
                                </div>
                                <p className="text-xl font-bold">{sprint.velocity || 52} pts</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiTarget size={14} className="opacity-80" />
                                    <p className="text-xs opacity-80">Progress</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold">{sprint.progress || 65}%</p>
                                    <div className="flex-1">
                                        <svg width="40" height="40" viewBox="0 0 160 160" className="text-white">
                                            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="white"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                strokeLinecap="round"
                                                transform="rotate(-90 80 80)"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiCalendar size={14} className="opacity-80" />
                                    <p className="text-xs opacity-80">Tasks</p>
                                </div>
                                <p className="text-xl font-bold">{sprintTasks.length}</p>
                                <p className="text-xs opacity-80 mt-1">in this sprint</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiTarget size={14} className="opacity-80" />
                                    <p className="text-xs opacity-80">Status</p>
                                </div>
                                <p className="text-lg font-bold">On Track</p>
                                <p className="text-xs opacity-80">No risks</p>
                            </div>
                        </div>
                    </div>

                    {/* Burndown Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4">Sprint Burndown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={burndownData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="ideal"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Ideal"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    name="Actual"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span className="text-xs text-gray-600">Ideal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                                <span className="text-xs text-gray-600">Actual</span>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Tasks in This Sprint</h2>
                        <div className="bg-white rounded-xl shadow-lg p-4">
                            {sprintTasks.length > 0 ? (
                                <TaskBoard sprintFilter={sprint.id} />
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-sm">No tasks in this sprint yet</p>
                                    <Link
                                        to="/tasks"
                                        className="inline-block mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                    >
                                        Create tasks for this sprint →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Retrospective */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-3">Retrospective</h2>
                        {sprint.retrospective ? (
                            <p className="text-sm text-gray-700 italic leading-relaxed">"{sprint.retrospective}"</p>
                        ) : (
                            <p className="text-sm text-gray-500">No retrospective notes yet. Add them after sprint completion.</p>
                        )}
                    </div>

                    {/* Edit Modal */}
                    <SprintModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        mode="edit"
                        initialData={sprint}
                    />
                </div>
            </div>
        </PageWrapper>
    );
}