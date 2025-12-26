import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

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

import { linkSprintToEpic } from '../../store/epicSlice';

/* -------------------- Sprint Card -------------------- */
function SprintCard({ sprint, isDragging }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: sprint.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all"
        >
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">{sprint.name}</h4>
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="1.5" fill="#9ca3af" opacity="0.8" />
                        <circle cx="16" cy="8" r="1.5" fill="#9ca3af" opacity="0.8" />
                        <circle cx="8" cy="12" r="1.5" fill="#9ca3af" opacity="0.8" />
                        <circle cx="16" cy="12" r="1.5" fill="#9ca3af" opacity="0.8" />
                        <circle cx="8" cy="16" r="1.5" fill="#9ca3af" opacity="0.8" />
                        <circle cx="16" cy="16" r="1.5" fill="#9ca3af" opacity="0.8" />
                    </svg>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{sprint.goal}</p>

            <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-500 capitalize">{sprint.type || 'monthly'}</span>
                <span className="font-bold text-indigo-600">{sprint.progress}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${sprint.progress}%` }}
                />
            </div>
        </div>
    );
}

/* -------------------- Epic Details Page -------------------- */
export default function EpicDetails() {
    const { epicId } = useParams();
    const dispatch = useDispatch();
    const { epics } = useSelector((state) => state.epic);
    const { sprints } = useSelector((state) => state.sprint);
    const [activeId, setActiveId] = useState(null);
    const [viewMode, setViewMode] = useState(ViewMode.Month);

    const epic = epics.find((e) => e.id === epicId);

    if (!epic) {
        return (
            <PageWrapper>
                <div className="text-center py-20">
                    <p className="text-xl text-gray-500">Epic not found</p>
                    <Link to="/epics" className="mt-4 inline-block text-indigo-600 hover:underline">
                        ← Back to Epics
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    /* -------------------- Progress Calculations -------------------- */
    const startDate = new Date(epic.startDate);
    const targetDate = new Date(epic.targetDate);
    const today = new Date('2025-12-26'); // Current date: December 26, 2025

    const daysTotal = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, daysTotal - daysElapsed);
    const timelineProgress = Math.max(0, Math.min(100, (daysElapsed / daysTotal) * 100));

    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (epic.progress / 100) * circumference;

    /* -------------------- Sprint Filtering -------------------- */
    const linkedSprints = sprints.filter((s) => epic.sprintIds.includes(s.id));
    const availableSprints = sprints.filter((s) => !epic.sprintIds.includes(s.id));

    /* -------------------- Gantt Tasks (Pure JS – No TS Syntax) -------------------- */
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
            progress: sprint.progress,
            dependencies: index > 0 ? [linkedSprints[index - 1].id] : undefined,
        })),
    ];

    /* -------------------- Drag & Drop Setup -------------------- */
    const sensors = useSensors(useSensor(PointerSensor));

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

    const colorBorder = {
        indigo: 'border-indigo-600',
        purple: 'border-purple-600',
        blue: 'border-blue-600',
        green: 'border-green-600',
        red: 'border-red-600',
        yellow: 'border-yellow-600',
    }[epic.color] || 'border-indigo-600';

    return (
        <PageWrapper>
            {/* Back Link */}
            <Link to="/epics" className="inline-block mb-6 text-indigo-600 hover:underline text-sm font-medium">
                ← Back to Epics
            </Link>

            {/* Epic Header */}
            <div className={`bg-white rounded-2xl shadow-lg p-8 mb-10 border-l-8 ${colorBorder}`}>
                <div className="flex justify-between items-start mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-4xl font-bold text-gray-900">{epic.title}</h1>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[epic.status] || 'bg-gray-100 text-gray-800'}`}>
                                {epic.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <p className="text-lg text-gray-600 max-w-4xl">{epic.description}</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="p-3 hover:bg-gray-100 rounded-xl transition">
                            <FiEdit2 className="text-xl text-gray-600" />
                        </button>
                        <button className="p-3 hover:bg-red-50 rounded-xl transition">
                            <FiTrash2 className="text-xl text-red-600" />
                        </button>
                    </div>
                </div>

                {/* Progress Visualizations */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Circular Progress */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <svg width="240" height="240" viewBox="0 0 200 200" className="-rotate-90">
                                <circle cx="100" cy="100" r="90" stroke="#e5e7eb" strokeWidth="18" fill="none" />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    stroke="#6366f1"
                                    strokeWidth="18"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-bold text-indigo-600">{epic.progress}%</span>
                            </div>
                        </div>
                        <p className="mt-6 text-xl font-semibold text-gray-800">Overall Progress</p>
                        <p className="text-gray-600">
                            {epic.completedSprints} of {epic.sprintCount} sprints completed
                        </p>
                    </div>

                    {/* Timeline Bar */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                            <FiCalendar className="mr-3 text-indigo-600" />
                            Epic Timeline
                        </h3>
                        <div className="flex justify-between text-sm text-gray-600 mb-3">
                            <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>{targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-10 overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                                style={{ width: `${timelineProgress}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                {daysElapsed > 0 ? `${daysElapsed} days elapsed • ${daysRemaining} remaining` : 'Not started'}
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-3">
                            {timelineProgress > 100 ? 'Overdue' : timelineProgress < epic.progress ? 'Ahead of schedule' : 'On track'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Gantt Chart */}
            <div className="mb-16">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Epic Roadmap</h2>
                    <div className="flex gap-2">
                        {[
                            { label: 'Day', mode: ViewMode.Day },
                            { label: 'Week', mode: ViewMode.Week },
                            { label: 'Month', mode: ViewMode.Month },
                        ].map(({ label, mode }) => (
                            <button
                                key={label}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === mode
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                    <Gantt
                        tasks={ganttTasks}
                        viewMode={viewMode}
                        listCellWidth="200px"
                        columnWidth={viewMode === ViewMode.Month ? 100 : viewMode === ViewMode.Week ? 80 : 60}
                        ganttHeight={400}
                        onDateChange={(task) => console.log('Rescheduled:', task)}
                        onProgressChange={(task) => console.log('Progress updated:', task)}
                        onClick={(task) => console.log('Clicked task:', task)}
                    />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    Drag bars to reschedule • Drag progress handle to update completion • Use buttons above to change view
                </p>
            </div>

            {/* Sprint Linking */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Sprint Management</h2>
                <p className="text-gray-600 mb-8">Drag sprints from the left to link them to this epic</p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(e) => setActiveId(e.active.id)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div id="available" className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 min-h-96">
                            <h3 className="text-lg font-semibold text-gray-700 mb-6">
                                Available Sprints ({availableSprints.length})
                            </h3>
                            <SortableContext items={availableSprints.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4">
                                    {availableSprints.length === 0 ? (
                                        <p className="text-center text-gray-500 py-12">No available sprints</p>
                                    ) : (
                                        availableSprints.map((sprint) => <SprintCard key={sprint.id} sprint={sprint} />)
                                    )}
                                </div>
                            </SortableContext>
                        </div>

                        <div id="linked" className="bg-indigo-50 rounded-2xl p-8 border-2 border-dashed border-indigo-300 min-h-96">
                            <h3 className="text-lg font-semibold text-indigo-700 mb-6">
                                Linked to Epic ({linkedSprints.length})
                            </h3>
                            <SortableContext items={linkedSprints.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4">
                                    {linkedSprints.length === 0 ? (
                                        <p className="text-center text-gray-500 py-12">Drag sprints here to link them</p>
                                    ) : (
                                        linkedSprints.map((sprint) => <SprintCard key={sprint.id} sprint={sprint} />)
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeSprint && <SprintCard sprint={activeSprint} isDragging />}
                    </DragOverlay>
                </DndContext>
            </div>
        </PageWrapper>
    );
}