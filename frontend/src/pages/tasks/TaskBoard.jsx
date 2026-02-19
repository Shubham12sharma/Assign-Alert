import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
import PageWrapper from '../../components/layout/PageWrapper';
import { setCommunityMembers } from '../../store/communitySlice';

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
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchPersonalTasks, fetchTasks, updateTaskStatus, addCommentToTask, updateTask, deleteTask } from '../../store/taskSlice';
import TaskModal from '../../components/common/TaskModal';
import { FiUser, FiSend, FiActivity, FiX, FiPlus, FiTag, FiCheckSquare } from 'react-icons/fi';
import { addNotification } from '../../store/notificationSlice';

// Optional: if you want sprint/epic selectors in the detail panel later,
// you can also pull them from Redux here:
// const { sprints } = useSelector((state) => state.sprint);
// const { epics } = useSelector((state) => state.epic);

const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'To Do', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Review', title: 'Review' },
    { id: 'Done', title: 'Done' },
];

const categoryColors = {
    Bug: 'bg-red-100 text-red-800 border border-red-200',
    Feature: 'bg-blue-100 text-blue-800 border border-blue-200',
    Design: 'bg-purple-100 text-purple-800 border border-purple-200',
    Documentation: 'bg-gray-100 text-gray-800 border border-gray-200',
    Deployment: 'bg-green-100 text-green-800 border border-green-200',
    Research: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
};

const tagColors = [
    'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'bg-pink-50 text-pink-700 border border-pink-200',
    'bg-teal-50 text-teal-700 border border-teal-200',
    'bg-orange-50 text-orange-700 border border-orange-200',
    'bg-cyan-50 text-cyan-700 border border-cyan-200',
    'bg-lime-50 text-lime-700 border border-lime-200',
];

const priorityColors = {
    High: 'bg-red-100 text-red-700 border border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Low: 'bg-green-100 text-green-700 border border-green-200',
    default: 'bg-gray-100 text-gray-600 border border-gray-200',
};

// Fixed TaskCard component
function TaskCard({ task, isDragging, onClick, realUsers }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
        id: task.id,
        disabled: isDragging
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging || isSortableDragging ? 0.5 : 1,
        cursor: isSortableDragging ? 'grabbing' : 'grab',
    };

    const getAssigneeName = () => {
        if (!task.assignee) return 'Unassigned';
        const assignedUser = realUsers?.find(u => u.id === task.assignee);
        if (assignedUser) {
            return assignedUser.name || assignedUser.username || `User ${task.assignee.substring(0, 4)}`;
        }
        if (task.assignee_name) return task.assignee_name;
        return `User ${task.assignee.substring(0, 4)}`;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 line-clamp-2 flex-1 text-sm">
                        {task.title}
                    </h4>
                    <div
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 touch-none"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Drag to reorder"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="5" r="1.5" fill="currentColor" />
                            <circle cx="15" cy="5" r="1.5" fill="currentColor" />
                            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="9" cy="19" r="1.5" fill="currentColor" />
                            <circle cx="15" cy="19" r="1.5" fill="currentColor" />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${categoryColors[task.category] || categoryColors.default}`}>
                        {task.category || 'Uncategorized'}
                    </span>
                    {task.tags && Array.isArray(task.tags) && task.tags.slice(0, 2).map((tag, idx) => (
                        <span
                            key={`${tag}-${idx}`}
                            className={`text-xs font-medium px-2 py-0.5 rounded border ${tagColors[idx % tagColors.length]}`}
                        >
                            {tag.length > 8 ? `${tag.substring(0, 8)}...` : tag}
                        </span>
                    ))}
                    {task.tags?.length > 2 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200">
                            +{task.tags.length - 2}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium px-2 py-0.5 rounded border ${priorityColors[task.priority] || priorityColors.default}`}>
                        {task.priority || 'Medium'}
                    </span>

                    <div className="flex items-center gap-1 text-gray-600">
                        <FiUser size={10} className="text-gray-500" />
                        <span className="truncate max-w-[80px]" title={getAssigneeName()}>
                            {getAssigneeName()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TaskBoard({ sprintFilter = null }) {
    const dispatch = useDispatch();
    const { tasks, loading } = useSelector((state) => state.task);
    const realUsers = useSelector((state) => state.community.realUsers || []);
    const { user } = useSelector((state) => state.auth);
    const { currentCommunity } = useSelector((state) => state.community);
    const { mode } = useSelector((state) => state.auth);

    const [activeId, setActiveId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionPos, setMentionPos] = useState(0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const location = useLocation();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (!currentCommunity) return;

        const fetchMembers = async () => {
            try {
                const res = await api.get(`/users/minimal/?community=${currentCommunity}`);
                const members = (res.data || []).map(u => ({
                    ...u,
                    name: u.name || u.username || u.email
                }));
                dispatch(setCommunityMembers(members));
            } catch (err) {
                console.error("Failed to fetch community members", err);
            }
        };

        fetchMembers();
    }, [currentCommunity, dispatch]);

    let visibleTasks;

    if (sprintFilter) {
        // Inside a sprint view: show all tasks linked to this sprint
        visibleTasks = tasks.filter(
            (task) =>
                task.sprint === sprintFilter ||
                task.sprintId === sprintFilter
        );
    } else if (mode === 'personal') {
        // Personal mode: all personal tasks already filtered by API
        visibleTasks = tasks;
    } else {
        // Corporate mode: show all tasks for the currently selected community (including sub-community)
        visibleTasks = tasks.filter(
            (task) =>
                task.community === currentCommunity ||
                task.communityId === currentCommunity
        );
    }

    useEffect(() => {
        if (!user) return;
        if (mode === 'personal') {
            dispatch(fetchPersonalTasks());
        } else if (currentCommunity) {
            dispatch(fetchTasks(currentCommunity));
        }
    }, [dispatch, user, mode, currentCommunity]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const taskId = params.get('task');
        if (taskId && visibleTasks.length > 0) {
            const t = visibleTasks.find((x) => x.id === taskId);
            if (t) {
                setSelectedTask(t);
                setEditingTask({ ...t });
                setIsPanelOpen(true);
            }
        }
    }, [location.search, visibleTasks]);

    useEffect(() => {
        if (selectedTask) {
            setEditingTask({ ...selectedTask });
            setIsPanelOpen(true);
        }
    }, [selectedTask?.id]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = visibleTasks.find((t) => t.id === active.id);
        if (!activeTask) return;

        const overColumnId =
            columns.find((c) => c.id === over.id)?.id ||
            visibleTasks.find((t) => t.id === over.id)?.status;

        if (overColumnId && activeTask.status !== overColumnId) {
            dispatch(updateTaskStatus({ taskId: activeTask.id, status: overColumnId }));
        }

        setActiveId(null);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setEditingTask({ ...task });
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setTimeout(() => {
            setSelectedTask(null);
            setEditingTask(null);
        }, 300);
    };

    const handleSaveTask = async () => {
        if (!editingTask) return;

        try {
            const dataToUpdate = {
                title: editingTask.title,
                description: editingTask.description,
                status: editingTask.status,
                assignee: editingTask.assignee || null,
                priority: editingTask.priority,
                category: editingTask.category,
                tags: Array.isArray(editingTask.tags) ? editingTask.tags : [],
            };

            const res = await dispatch(updateTask({
                taskId: editingTask.id,
                data: dataToUpdate
            }));

            if (updateTask.fulfilled.match(res)) {
                setSelectedTask(res.payload);
                setEditingTask(res.payload);
                dispatch(addNotification({
                    id: `save-${Date.now()}`,
                    type: 'success',
                    message: 'Task updated successfully',
                }));
            }
        } catch (err) {
            console.error('Update task failed', err);
            dispatch(addNotification({
                id: `error-${Date.now()}`,
                type: 'error',
                message: 'Failed to update task',
            }));
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        try {
            const res = await dispatch(deleteTask(selectedTask.id));
            if (deleteTask.fulfilled.match(res)) {
                handleClosePanel();
                dispatch(addNotification({
                    id: `delete-${Date.now()}`,
                    type: 'success',
                    message: 'Task deleted successfully',
                }));
            }
        } catch (err) {
            console.error('Delete task failed', err);
        }
    };

    const handleCommentChange = (e) => {
        const value = e.target.value;
        setNewComment(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        if (lastAt !== -1 && (cursorPos === value.length || value[cursorPos] === ' ' || value[cursorPos] === undefined)) {
            const query = textBeforeCursor.substring(lastAt + 1);
            setMentionQuery(query);
            setMentionPos(lastAt);
            setShowMentions(true);
        } else {
            setShowMentions(false);
            setMentionQuery('');
        }
    };

    const insertMention = (display) => {
        const before = newComment.substring(0, mentionPos);
        const after = newComment.substring(mentionPos + 1 + mentionQuery.length);
        setNewComment(`${before}@${display} ${after}`);
        setShowMentions(false);
        setMentionQuery('');
    };

    const filteredMembers = realUsers
        .filter((m) => {
            if (!mentionQuery) return true;
            const hay = ((m.name || m.username || m.email || '') + '').toLowerCase();
            const q = mentionQuery.toLowerCase();
            return hay.includes(q);
        })
        .slice(0, 6);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTask) return;

        const optimisticComment = {
            id: `temp-${Date.now()}`,
            user: user?.name || user?.username || 'You',
            text: newComment.trim(),
            timestamp: new Date().toISOString(),
        };

        setSelectedTask((prev) => ({
            ...prev,
            comments: [...(prev.comments || []), optimisticComment],
        }));

        const result = await dispatch(
            addCommentToTask({
                taskId: selectedTask.id,
                comment: newComment.trim(),
            })
        );

        if (addCommentToTask.fulfilled.match(result)) {
            const { comment } = result.payload;

            setSelectedTask((prev) => ({
                ...prev,
                comments: (prev.comments || []).map((c) =>
                    c.id.startsWith('temp-') ? comment : c
                ),
            }));

            const mentions = newComment.match(/@([a-zA-Z0-9_.-]+)/g) || [];
            for (const mention of mentions) {
                const raw = mention.slice(1);
                const username = raw.toLowerCase();

                const member = realUsers.find((m) => {
                    if (!m) return false;
                    const uname = (m.username || '').toLowerCase();
                    const name = (m.name || '').toLowerCase();
                    const emailPrefix = (m.email || '').split('@')[0].toLowerCase();
                    return uname === username || name === username || emailPrefix === username;
                });

                if (member && member.id !== user?.id) {
                    try {
                        await api.post('/alerts/', {
                            type: 'mention',
                            message: `You were mentioned in task "${selectedTask.title}"`,
                            user: member.id,
                            task: selectedTask.id,
                            read: false,
                        });
                    } catch (err) {
                        console.warn('Failed to create mention alert', err);
                    }
                }
            }
        } else {
            setSelectedTask((prev) => ({
                ...prev,
                comments: prev.comments?.filter((c) => !c.id.startsWith('temp-')) || [],
            }));
        }

        setNewComment('');
    };

    const handleAddTag = () => {
        const input = document.getElementById('newTag');
        const tag = input?.value.trim();
        if (tag && editingTask) {
            const currentTags = Array.isArray(editingTask.tags) ? editingTask.tags : [];
            if (!currentTags.includes(tag)) {
                setEditingTask({
                    ...editingTask,
                    tags: [...currentTags, tag]
                });
                input.value = '';
            }
        }
    };

    const handleRemoveTag = (indexToRemove) => {
        if (editingTask) {
            const currentTags = Array.isArray(editingTask.tags) ? editingTask.tags : [];
            setEditingTask({
                ...editingTask,
                tags: currentTags.filter((_, idx) => idx !== indexToRemove)
            });
        }
    };

    if (loading && !visibleTasks.length) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500 animate-pulse flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Loading tasks...</span>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 flex-shrink-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {mode === 'personal' ? 'My Personal Tasks' : 'My Assigned Tasks'}
                        </h1>
                        <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <FiPlus size={16} /> Create Task
                        </button>
                    </div>

                    {/* Task Board - Takes remaining height */}
                    <div className="flex-1 min-h-0">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={(e) => setActiveId(e.active.id)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="h-full flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {columns.map((column) => {
                                    const columnTasks = visibleTasks.filter((t) => t.status === column.id);

                                    return (
                                        <div key={column.id} className="flex-shrink-0 w-[260px] sm:w-72 flex flex-col h-full">
                                            {/* Column Header */}
                                            <div className="bg-white/90 backdrop-blur-sm rounded-t-lg px-3 py-2 border border-gray-200 shadow-sm flex items-center justify-between flex-shrink-0">
                                                <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                                                    {column.title}
                                                </h3>
                                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                    {columnTasks.length}
                                                </span>
                                            </div>

                                            {/* Column Content - Scrollable */}
                                            <SortableContext
                                                items={columnTasks.map((t) => t.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="flex-1 bg-gray-50/70 rounded-b-lg p-2 space-y-2 border border-gray-200 border-t-0 overflow-y-auto min-h-0">
                                                    {columnTasks.map((task) => (
                                                        <TaskCard
                                                            key={task.id}
                                                            task={task}
                                                            onClick={() => handleTaskClick(task)}
                                                            realUsers={realUsers}
                                                        />
                                                    ))}

                                                    {columnTasks.length === 0 && (
                                                        <div className="text-center text-gray-400 py-8 italic text-xs">
                                                            No tasks
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </div>
                                    );
                                })}
                            </div>

                            <DragOverlay dropAnimation={{
                                duration: 200,
                                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                            }}>
                                {activeId && (
                                    <TaskCard
                                        task={visibleTasks.find((t) => t.id === activeId)}
                                        isDragging
                                        realUsers={realUsers}
                                    />
                                )}
                            </DragOverlay>
                        </DndContext>
                    </div>

                    {/* Create Task Modal */}
                    <TaskModal
                        isOpen={isTaskModalOpen}
                        onClose={() => setIsTaskModalOpen(false)}
                        defaultSprintId={sprintFilter || ''}
                    />

                    {/* Task Detail Panel */}
                    {selectedTask && editingTask && (
                        <>
                            {/* Backdrop */}
                            <div
                                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                                onClick={handleClosePanel}
                                role="button"
                                tabIndex={-1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') handleClosePanel();
                                }}
                                aria-label="Close panel"
                            />

                            {/* Slide-in Panel */}
                            <div className={`fixed right-0 top-0 h-full w-full sm:w-[400px] lg:w-[480px] bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                                }`}>
                                {/* Header */}
                                <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <input
                                                type="text"
                                                value={editingTask.title || ''}
                                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                                className="w-full text-lg font-semibold text-gray-900 focus:outline-none border-b border-transparent hover:border-gray-300 focus:border-indigo-500 transition-colors pb-0.5 bg-transparent"
                                                placeholder="Task title"
                                            />
                                        </div>
                                        <button
                                            onClick={handleClosePanel}
                                            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-full transition-colors duration-200 flex-shrink-0"
                                            aria-label="Close panel"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveTask}
                                            className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-1.5 text-sm"
                                        >
                                            <FiCheckSquare size={14} />
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={handleDeleteTask}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 hover:border-red-200 font-medium transition-all duration-200"
                                            aria-label="Delete task"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                        <textarea
                                            value={editingTask.description || ''}
                                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-700 placeholder:text-gray-400 resize-none h-20"
                                            placeholder="Add a detailed description..."
                                        />
                                    </div>

                                    {/* Status, Priority */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                            <select
                                                value={editingTask.status || 'To Do'}
                                                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            >
                                                {columns.map(c => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                                            <select
                                                value={editingTask.priority || 'Medium'}
                                                onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                                        <select
                                            value={editingTask.category || 'Feature'}
                                            onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        >
                                            <option value="Bug">Bug</option>
                                            <option value="Feature">Feature</option>
                                            <option value="Design">Design</option>
                                            <option value="Documentation">Documentation</option>
                                            <option value="Deployment">Deployment</option>
                                            <option value="Research">Research</option>
                                        </select>
                                    </div>

                                    {/* Assignee */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <FiUser size={12} />
                                            Assignee
                                        </label>
                                        <select
                                            value={editingTask.assignee || ''}
                                            onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        >
                                            <option value="">Unassigned</option>
                                            {realUsers.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name || u.username || u.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <FiTag size={12} />
                                            Tags
                                        </label>
                                        <div className="flex flex-wrap gap-1 mb-2 min-h-[28px]">
                                            {editingTask.tags && Array.isArray(editingTask.tags) && editingTask.tags.length > 0 ? (
                                                editingTask.tags.map((tag, idx) => (
                                                    <div
                                                        key={`${tag}-${idx}`}
                                                        className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${tagColors[idx % tagColors.length]}`}
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTag(idx)}
                                                            className="ml-0.5 hover:opacity-70 transition-opacity font-bold"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No tags added yet</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="newTag"
                                                placeholder="Add a tag..."
                                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTag();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddTag}
                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm whitespace-nowrap"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Activity Log */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                            <FiActivity size={14} className="text-indigo-600" />
                                            Activity Log
                                        </h4>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {selectedTask.activity_logs && selectedTask.activity_logs.length > 0 ? (
                                                selectedTask.activity_logs.slice(0, 3).map((log, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-gray-50 p-2 rounded border border-gray-200 text-xs"
                                                    >
                                                        <p className="text-gray-600">
                                                            <span className="font-medium text-indigo-600">System</span>{' '}
                                                            {log.action || 'updated the task'}
                                                        </p>
                                                        <p className="text-gray-400 text-[10px] mt-0.5">
                                                            {new Date(log.timestamp || Date.now()).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-center py-3 text-xs italic bg-gray-50 rounded border border-dashed border-gray-200">
                                                    No activity logged yet
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                            <FiSend size={14} className="text-indigo-600" />
                                            Comments
                                        </h4>

                                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                                            {selectedTask.comments && selectedTask.comments.length > 0 ? (
                                                selectedTask.comments.map((comment) => (
                                                    <div
                                                        key={comment.id}
                                                        className="flex items-start gap-2 bg-gray-50 p-2 rounded border border-gray-200"
                                                    >
                                                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                                                            {comment.user?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                                <span className="font-medium text-gray-700 text-xs">
                                                                    {comment.user || 'Anonymous'}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(comment.timestamp).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap break-words">
                                                                {comment.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 bg-gray-50 rounded border border-dashed border-gray-200">
                                                    <p className="text-gray-400 text-xs italic">No comments yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Comment Input */}
                                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 shadow-lg flex-shrink-0">
                                    <form onSubmit={handleAddComment} className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={handleCommentChange}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-10"
                                                placeholder="Write a comment or @mention..."
                                            />

                                            <button
                                                type="submit"
                                                disabled={!newComment.trim()}
                                                className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md font-medium transition-all duration-200 flex items-center justify-center ${newComment.trim()
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                aria-label="Send comment"
                                            >
                                                <FiSend size={14} />
                                            </button>
                                        </div>

                                        {showMentions && filteredMembers.length > 0 && (
                                            <div className="absolute bottom-full left-0 mb-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-30 max-h-48 overflow-y-auto">
                                                {filteredMembers.map((member) => (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        onClick={() => {
                                                            insertMention(
                                                                member.name || member.username || member.email?.split('@')[0]
                                                            );
                                                        }}
                                                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                                                            {(member.name || member.username || member.email?.[0] || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-700 text-xs truncate">
                                                                {member.name || member.username}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 truncate">
                                                                {member.email || `@${member.username}`}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageWrapper>
    );}