import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { FiEdit2, FiTrash2, FiCalendar, FiTarget, FiTrendingUp, FiArrowLeft, FiPlus } from 'react-icons/fi';

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

import { linkSprintToEpic, fetchEpics, deleteEpic, updateEpic } from '../../store/epicSlice';
import { deleteSprint, fetchSprints } from '../../store/sprintSlice';
import CreateSprintModal from '../../components/common/CreateSprintModal';

/* -------------------- Sprint Card -------------------- */
function SprintCard({ sprint, isDragging }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: sprint.id,
        disabled: isDragging
    });
    const dispatch = useDispatch();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete sprint: ${sprint.name}?`)) {
            dispatch(deleteSprint(sprint.id));
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'planned':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{sprint.name}</h4>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(sprint.status)}`}>
                                {sprint.status?.toUpperCase() || 'PLANNED'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{sprint.goal}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-100 rounded">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="1.5" fill="#9ca3af" />
                                <circle cx="16" cy="8" r="1.5" fill="#9ca3af" />
                                <circle cx="8" cy="12" r="1.5" fill="#9ca3af" />
                                <circle cx="16" cy="12" r="1.5" fill="#9ca3af" />
                                <circle cx="8" cy="16" r="1.5" fill="#9ca3af" />
                                <circle cx="16" cy="16" r="1.5" fill="#9ca3af" />
                            </svg>
                        </div>
                        <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 rounded transition-colors">
                            <FiTrash2 className="text-red-500" size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500 capitalize">{sprint.type || 'monthly'}</span>
                    <span className="font-medium text-indigo-600">{sprint.progress || 0}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${sprint.progress || 0}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

/* -------------------- Epic Details Page -------------------- */
export default function EpicDetails() {
    const { epicId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { epics, loading } = useSelector((state) => state.epic);
    const { sprints } = useSelector((state) => state.sprint);
    const { currentCommunity } = useSelector((state) => state.community);
    const [activeId, setActiveId] = useState(null);
    const [viewMode, setViewMode] = useState(ViewMode.Month);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);

    // DnD sensors MUST be declared before any early returns to keep hook order stable
    const sensors = useSensors(useSensor(PointerSensor));

    const epic = epics.find((e) => e.id === epicId);

    useEffect(() => {
        if (currentCommunity) {
            dispatch(fetchEpics({ community: currentCommunity }));
        }
    }, [dispatch, currentCommunity]);

    useEffect(() => {
        if (epicId) {
            dispatch(fetchSprints({ epic: epicId }));
        }
    }, [dispatch, epicId]);

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500 animate-pulse flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Loading epic details...</span>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (!epic) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <FiTarget className="mx-auto text-5xl text-gray-300 mb-4" />
                        <p className="text-xl text-gray-500 mb-4">Epic not found</p>
                        <Link to="/epics" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                            <FiArrowLeft size={16} />
                            Back to Epics
                        </Link>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    /* -------------------- Progress Calculations -------------------- */
    const startDate = new Date(epic.startDate);
    const targetDate = new Date(epic.targetDate);
    const today = new Date();

    const daysTotal = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, daysTotal - daysElapsed);
    const timelineProgress = Math.min(100, Math.max(0, (daysElapsed / daysTotal) * 100));

    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (epic.progress / 100) * circumference;

    /* -------------------- Sprint Filtering -------------------- */
    const linkedSprints = sprints.filter((s) => s.epicId === epic.id);
    const availableSprints = sprints.filter((s) => s.epicId !== epic.id);

    /* -------------------- Gantt Tasks -------------------- */
    const ganttTasks = [
        {
            start: startDate,
            end: targetDate,
            name: epic.title,
            id: `epic-${epic.id}`,
            type: 'project',
            progress: epic.progress,
            isDisabled: true,
            styles: {
                progressColor: '#6366f1',
                progressSelectedColor: '#4f46e5',
                backgroundColor: '#a5b4fc',
                backgroundSelectedColor: '#818cf8',
            },
        },
        ...linkedSprints.map((sprint, index) => ({
            start: new Date(sprint.startDate),
            end: new Date(sprint.endDate),
            name: sprint.name,
            id: sprint.id,
            type: 'task',
            project: `epic-${epic.id}`,
            progress: sprint.progress || 0,
            dependencies: index > 0 ? [linkedSprints[index - 1].id] : undefined,
        })),
    ];

    /* -------------------- Drag & Drop Setup -------------------- */
    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const sprintId = active.id;
        const link = over.id === 'linked';

        dispatch(
            linkSprintToEpic({
                epicId: epic.id,
                sprintId,
                link,
            })
        );

        setActiveId(null);
    };

    const activeSprint = sprints.find((s) => s.id === activeId);

    /* -------------------- Status & Color Mapping -------------------- */
    const statusColors = {
        planned: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
    };

    const colorClasses = {
        indigo: 'border-l-indigo-600',
        purple: 'border-l-purple-600',
        blue: 'border-l-blue-600',
        green: 'border-l-green-600',
        red: 'border-l-red-600',
        yellow: 'border-l-yellow-600',
    };

    const borderColorClass = colorClasses[epic.color] || 'border-l-indigo-600';

    return (
        <PageWrapper>
            <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Back Link */}
                    <Link to="/epics" className="inline-flex items-center gap-2 mb-6 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                        <FiArrowLeft size={16} />
                        Back to Epics
                    </Link>

                    {/* Epic Header */}
                    <div className={`bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 ${borderColorClass}`}>
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-2xl font-bold text-gray-900">{epic.title}</h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[epic.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {epic.status?.replace('_', ' ').toUpperCase() || 'PLANNED'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 max-w-3xl">{epic.description}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    onClick={() => {
                                        setEditForm({
                                            title: epic.title || '',
                                            description: epic.description || '',
                                            status: epic.status || 'planned',
                                            color: epic.color || 'indigo',
                                            startDate: epic.startDate
                                                ? new Date(epic.startDate).toISOString().split('T')[0]
                                                : '',
                                            targetDate: epic.targetDate
                                                ? new Date(epic.targetDate).toISOString().split('T')[0]
                                                : '',
                                        });
                                        setIsEditOpen(true);
                                    }}
                                >
                                    <FiEdit2 className="text-gray-600" size={18} />
                                </button>
                                <button
                                    className="p-2 hover:bg-red-50 rounded-lg transition"
                                    onClick={() => {
                                        if (!window.confirm('Delete this epic? This cannot be undone.')) return;
                                        dispatch(deleteEpic(epic.id)).then((res) => {
                                            if (!res.error) {
                                                navigate('/epics', { replace: true });
                                            }
                                        });
                                    }}
                                >
                                    <FiTrash2 className="text-red-600" size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Progress Visualizations */}
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            {/* Circular Progress */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <svg width="180" height="180" viewBox="0 0 200 200" className="-rotate-90">
                                        <circle cx="100" cy="100" r="70" stroke="#e5e7eb" strokeWidth="14" fill="none" />
                                        <circle
                                            cx="100"
                                            cy="100"
                                            r="70"
                                            stroke="#6366f1"
                                            strokeWidth="14"
                                            fill="none"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-indigo-600">{epic.progress}%</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm font-medium text-gray-700">Overall Progress</p>
                                <p className="text-xs text-gray-500">
                                    {epic.completedSprints || 0} of {epic.sprintCount || 0} sprints completed
                                </p>
                            </div>

                            {/* Timeline Bar */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-700">
                                    <FiCalendar className="mr-2 text-indigo-600" size={16} />
                                    Epic Timeline
                                </h3>
                                <div className="flex justify-between text-xs text-gray-600 mb-2">
                                    <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span>{targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                                        style={{ width: `${timelineProgress}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                                        {daysElapsed > 0 ? `${daysElapsed}d elapsed • ${daysRemaining}d left` : 'Not started'}
                                    </div>
                                </div>
                                <p className="text-center text-xs text-gray-500 mt-2">
                                    {timelineProgress > 100 ? 'Overdue' :
                                        timelineProgress < epic.progress ? 'Ahead of schedule' : 'On track'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Gantt Chart */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h2 className="text-lg font-semibold">Epic Roadmap</h2>
                            <div className="flex gap-2">
                                {[
                                    { label: 'Day', mode: ViewMode.Day },
                                    { label: 'Week', mode: ViewMode.Week },
                                    { label: 'Month', mode: ViewMode.Month },
                                ].map(({ label, mode }) => (
                                    <button
                                        key={label}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === mode
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <Gantt
                                tasks={ganttTasks}
                                viewMode={viewMode}
                                listCellWidth="180px"
                                columnWidth={viewMode === ViewMode.Month ? 100 : viewMode === ViewMode.Week ? 80 : 60}
                                ganttHeight={350}
                                onDateChange={(task) => console.log('Rescheduled:', task)}
                                onProgressChange={(task) => console.log('Progress updated:', task)}
                                onClick={(task) => console.log('Clicked task:', task)}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Drag bars to reschedule • Use buttons above to change view
                        </p>
                    </div>

                    {/* Sprint Linking */}
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">Sprint Management</h2>
                                <p className="text-xs text-gray-600 mt-1">Drag sprints to link them to this epic</p>
                            </div>
                            <button
                                onClick={() => setIsSprintModalOpen(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm transition-colors"
                            >
                                <FiPlus size={14} />
                                Create Sprint
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={(e) => setActiveId(e.active.id)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="grid lg:grid-cols-2 gap-4">
                                {/* Available Sprints */}
                                <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 min-h-[400px]">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Available Sprints ({availableSprints.length})
                                    </h3>
                                    <SortableContext items={availableSprints.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3">
                                            {availableSprints.length === 0 ? (
                                                <div className="text-center text-gray-500 py-8 text-sm">
                                                    No available sprints
                                                </div>
                                            ) : (
                                                availableSprints.map((sprint) => (
                                                    <SprintCard key={sprint.id} sprint={sprint} />
                                                ))
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>

                                {/* Linked Sprints */}
                                <div className="bg-indigo-50 rounded-lg p-4 border-2 border-dashed border-indigo-300 min-h-[400px]">
                                    <h3 className="text-sm font-medium text-indigo-700 mb-3">
                                        Linked to Epic ({linkedSprints.length})
                                    </h3>
                                    <SortableContext items={linkedSprints.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3">
                                            {linkedSprints.length === 0 ? (
                                                <div className="text-center text-gray-500 py-8 text-sm">
                                                    Drag sprints here to link them
                                                </div>
                                            ) : (
                                                linkedSprints.map((sprint) => (
                                                    <SprintCard key={sprint.id} sprint={sprint} />
                                                ))
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>
                            </div>

                            <DragOverlay dropAnimation={{ duration: 200 }}>
                                {activeSprint && <SprintCard sprint={activeSprint} isDragging />}
                            </DragOverlay>
                        </DndContext>
                    </div>

                    {/* Create Sprint Modal */}
                    <CreateSprintModal
                        isOpen={isSprintModalOpen}
                        onClose={() => setIsSprintModalOpen(false)}
                        epicId={epic.id}
                    />
                </div>

                    {/* Edit Epic Modal */}
                    {isEditOpen && editForm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Edit Epic</h2>
                                    <button
                                        onClick={() => setIsEditOpen(false)}
                                        className="text-gray-500 hover:text-gray-800"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form
                                    className="p-6 space-y-5"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        // Basic validation
                                        if (!editForm.title || !editForm.startDate || !editForm.targetDate) return;

                                        const payload = {
                                            title: editForm.title,
                                            description: editForm.description,
                                            status: editForm.status,
                                            color: editForm.color,
                                            start_date: `${editForm.startDate}T00:00:00Z`,
                                            end_date: `${editForm.targetDate}T00:00:00Z`,
                                        };

                                        dispatch(updateEpic({ id: epic.id, updates: payload })).then((res) => {
                                            if (!res.error) {
                                                setIsEditOpen(false);
                                            }
                                        });
                                    }}
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Epic Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) =>
                                                setEditForm((f) => ({ ...f, title: e.target.value }))
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={editForm.description}
                                            onChange={(e) =>
                                                setEditForm((f) => ({ ...f, description: e.target.value }))
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={editForm.startDate}
                                                onChange={(e) =>
                                                    setEditForm((f) => ({ ...f, startDate: e.target.value }))
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Target Date
                                            </label>
                                            <input
                                                type="date"
                                                value={editForm.targetDate}
                                                min={editForm.startDate}
                                                onChange={(e) =>
                                                    setEditForm((f) => ({ ...f, targetDate: e.target.value }))
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) =>
                                                    setEditForm((f) => ({ ...f, status: e.target.value }))
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            >
                                                <option value="planned">Planned</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color Accent
                                            </label>
                                            <div className="flex gap-2">
                                                {['indigo', 'purple', 'blue', 'green', 'red', 'yellow'].map(
                                                    (color) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() =>
                                                                setEditForm((f) => ({ ...f, color }))
                                                            }
                                                            className={`w-8 h-8 rounded-lg ${
                                                                color === 'indigo'
                                                                    ? 'bg-indigo-600'
                                                                    : color === 'purple'
                                                                    ? 'bg-purple-600'
                                                                    : color === 'blue'
                                                                    ? 'bg-blue-600'
                                                                    : color === 'green'
                                                                    ? 'bg-green-600'
                                                                    : color === 'red'
                                                                    ? 'bg-red-600'
                                                                    : 'bg-yellow-500'
                                                            } ${
                                                                editForm.color === color
                                                                    ? 'ring-2 ring-offset-2 ring-gray-400'
                                                                    : ''
                                                            }`}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditOpen(false)}
                                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
            </div>
        </PageWrapper>
    );
}