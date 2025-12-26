import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchTasks, updateTaskStatus } from '../../store/taskSlice';
import { FiUser } from 'react-icons/fi';

const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
];

const categoryColors = {
    Bug: 'bg-red-100 text-red-800',
    Feature: 'bg-blue-100 text-blue-800',
    Design: 'bg-purple-100 text-purple-800',
    Documentation: 'bg-gray-100 text-gray-800',
    Deployment: 'bg-green-100 text-green-800',
    Research: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800',
};

const tagColors = [
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-teal-100 text-teal-800',
    'bg-orange-100 text-orange-800',
    'bg-cyan-100 text-cyan-800',
    'bg-lime-100 text-lime-800',
];

function TaskCard({ task, isDragging }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColor = {
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Low: 'bg-green-100 text-green-800',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition"
        >
            <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
                <div {...attributes} {...listeners}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-1"
                    >
                        <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
                        <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
                        <circle cx="8" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
                        <circle cx="16" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
                        <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
                        <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[task.category] || categoryColors.default}`}>
                    {task.category}
                </span>
                {task.tags?.map((tag, idx) => (
                    <span key={tag} className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColors[idx % tagColors.length]}`}>
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColor[task.priority]}`}>
                    {task.priority}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                    <FiUser className="mr-1" />
                    {task.assignee?.name || task.assignee || 'Unassigned'}
                </div>
            </div>
        </div>
    );
}

export default function TaskBoard() {
    const dispatch = useDispatch();
    const { tasks, loading } = useSelector((state) => state.task);
    const { currentCommunity } = useSelector((state) => state.community);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (currentCommunity?.id) {
            dispatch(fetchTasks({ communityId: currentCommunity.id }));
        }
    }, [dispatch, currentCommunity]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t.id === active.id);
        const overColumnId = columns.find((c) => c.id === over.id)?.id ||
            tasks.find((t) => t.id === over.id)?.status;

        if (activeTask && overColumnId && activeTask.status !== overColumnId) {
            dispatch(updateTaskStatus({ taskId: activeTask.id, newStatus: overColumnId }));
        }
        setActiveId(null);
    };

    const getTasksByStatus = (status) => tasks.filter((task) => task.status === status);
    const activeTask = tasks.find((t) => t.id === activeId);

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500">Loading tasks...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Task Kanban Board</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    + Create Task
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex space-x-6 overflow-x-auto pb-6">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-shrink-0 w-80">
                            <div className="bg-gray-100 rounded-t-lg px-4 py-3 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700 uppercase text-sm">
                                    {column.title} ({getTasksByStatus(column.id).length})
                                </h3>
                            </div>

                            <SortableContext
                                items={getTasksByStatus(column.id).map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="bg-gray-50 min-h-screen rounded-b-lg p-4 space-y-3">
                                    {getTasksByStatus(column.id).map((task) => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                    <button className="w-full py-3 text-center text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition">
                                        + Add Task
                                    </button>
                                </div>
                            </SortableContext>
                        </div>
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
                </DragOverlay>
            </DndContext>
        </PageWrapper>
    );
}