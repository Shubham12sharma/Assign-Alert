import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import SprintModal from '../../components/common/SprintModal';
import TaskBoard from '../tasks/TaskBoard'; // Reuse your existing Kanban
import { setCurrentSprint } from '../../store/sprintSlice';
import { FiEdit2, FiTarget, FiTrendingUp, FiCalendar } from 'react-icons/fi';
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
    const { sprints, currentSprint } = useSelector((state) => state.sprint);
    const { tasks } = useSelector((state) => state.task);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const sprint = sprints.find((s) => s.id === sprintId);

    useEffect(() => {
        if (sprint && (!currentSprint || currentSprint.id !== sprint.id)) {
            dispatch(setCurrentSprint(sprint));
        }
    }, [sprint, currentSprint, dispatch]);

    if (!sprint) {
        return (
            <PageWrapper>
                <div className="text-center py-20">
                    <p className="text-xl text-gray-500">Sprint not found</p>
                    <Link to="/sprints" className="mt-4 inline-block text-indigo-600 hover:underline">
                        ← Back to Sprints
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    /* -------------------- Burndown Data (Mock – replace with real later) -------------------- */
    const totalPoints = 60; // From sprint planning
    const daysInSprint = Math.ceil(
        (new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)
    );

    const burndownData = [];
    for (let i = 0; i <= daysInSprint; i++) {
        const date = new Date(sprint.startDate);
        date.setDate(date.getDate() + i);
        const ideal = Math.max(0, totalPoints - (totalPoints / daysInSprint) * i);
        const actual = Math.max(0, totalPoints - (sprint.progress / 100) * totalPoints * (i / daysInSprint));
        burndownData.push({
            day: i,
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            ideal: Math.round(ideal),
            actual: Math.round(actual),
        });
    }

    /* -------------------- Sprint Tasks -------------------- */
    // Mock: Filter tasks that belong to this sprint (in real app: use sprint.taskIds)
    const sprintTasks = tasks.filter((task) => task.communityId === sprint.communityId); // Temporary

    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (sprint.progress / 100) * circumference;

    return (
        <PageWrapper>
            {/* Back & Edit */}
            <div className="flex justify-between items-center mb-8">
                <Link to="/sprints" className="text-indigo-600 hover:underline font-medium">
                    ← Back to Sprint Dashboard
                </Link>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 font-medium shadow"
                >
                    <FiEdit2 /> Edit Sprint
                </button>
            </div>

            {/* Sprint Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-10 text-white mb-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-6 mb-4">
                            <h1 className="text-5xl font-bold">{sprint.name}</h1>
                            <span className="bg-white text-indigo-700 px-6 py-3 rounded-full text-lg font-bold">
                                {sprint.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                        </div>
                        <p className="text-2xl opacity-90 max-w-4xl">{sprint.goal}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg opacity-80">Sprint Period</p>
                        <p className="text-3xl font-bold mt-2">
                            {new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-lg mt-2 opacity-80 capitalize">{sprint.type || 'Monthly'} Sprint</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-3">
                            <FiTrendingUp className="text-3xl" />
                            <p className="text-lg">Velocity</p>
                        </div>
                        <p className="text-5xl font-bold">{sprint.velocity || 52} pts</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-3">
                            <FiTarget className="text-3xl" />
                            <p className="text-lg">Progress</p>
                        </div>
                        <div className="flex items-end gap-6">
                            <p className="text-5xl font-bold">{sprint.progress}%</p>
                            <div className="w-32">
                                <svg width="140" height="140" viewBox="0 0 200 200" className="-rotate-90">
                                    <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.2)" strokeWidth="16" fill="none" />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="90"
                                        stroke="white"
                                        strokeWidth="16"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="relative -mt-32 flex justify-center">
                                    <span className="text-4xl font-bold">{sprint.progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-3">
                            <FiCalendar className="text-3xl" />
                            <p className="text-lg">Tasks</p>
                        </div>
                        <p className="text-5xl font-bold">{sprintTasks.length}</p>
                        <p className="text-lg opacity-80 mt-2">In this sprint</p>
                    </div>
                </div>
            </div>

            {/* Burndown Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                <h2 className="text-2xl font-bold mb-6">Sprint Burndown</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={burndownData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                            labelStyle={{ color: '#e5e7eb' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="ideal"
                            stroke="#10b981"
                            strokeWidth={3}
                            name="Ideal Burndown"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#6366f1"
                            strokeWidth={3}
                            name="Actual Burndown"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-8 mt-6">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-gray-700">Ideal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                        <span className="text-gray-700">Actual</span>
                    </div>
                </div>
            </div>

            {/* Tasks in this Sprint */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Tasks in This Sprint</h2>
                {/* Reuse your existing TaskBoard, filtered to this sprint */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <TaskBoard sprintFilter={sprint.id} /> {/* You'll need to add filtering logic to TaskBoard */}
                </div>
            </div>

            {/* Retrospective */}
            <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Retrospective</h2>
                {sprint.retrospective ? (
                    <p className="text-lg text-gray-700 italic">"{sprint.retrospective}"</p>
                ) : (
                    <p className="text-gray-500">No retrospective notes yet. Add them after sprint completion.</p>
                )}
            </div>

            {/* Edit Modal */}
            <SprintModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                initialData={sprint}
            />
        </PageWrapper>
    );
}