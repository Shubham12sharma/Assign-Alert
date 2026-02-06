import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
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
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchPersonalTasks, fetchTasks, updateTaskStatus, addCommentToTask, updateTask, deleteTask } from '../../store/taskSlice';
import TaskModal from '../../components/common/TaskModal';
import { FiUser, FiSend, FiActivity, FiX, FiPlus } from 'react-icons/fi';
import { addNotification } from '../../store/notificationSlice';


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

function TaskCard({ task, isDragging, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1 leading-tight">
                        {task.title}
                    </h4>
                    <div
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-50"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="5" r="1.5" />
                            <circle cx="15" cy="5" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="15" cy="19" r="1.5" />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-lg border ${categoryColors[task.category] || categoryColors.default}`}>
                        {task.category || 'Uncategorized'}
                    </span>
                    {task.tags?.map((tag, idx) => (
                        <span
                            key={tag}
                            className={`text-xs font-medium px-3 py-1 rounded-lg border ${tagColors[idx % tagColors.length]}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium px-3 py-1 rounded-lg border ${priorityColors[task.priority] || priorityColors.default}`}>
                        {task.priority || 'Medium'}
                    </span>

                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <FiUser size={14} className="text-gray-500" />
                        <span className="truncate max-w-[140px]">
                            {task.assignee ? `User ${task.assignee.slice(0, 8)}${task.assignee.length > 8 ? '...' : ''}` : 'Unassigned'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TaskBoard() {
    const dispatch = useDispatch();
    const { tasks, loading } = useSelector((state) => state.task);
    const realUsers = useSelector((state) => state.community.realUsers || []);
    const { user } = useSelector((state) => state.auth);
    const { currentCommunity } = useSelector((state) => state.community);
    const { mode } = useSelector((state) => state.auth);

    const [activeId, setActiveId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionPos, setMentionPos] = useState(0);

    const location = useLocation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Determine which tasks to show
    const visibleTasks = mode === 'personal'
        ? tasks
        : tasks.filter(task => task.assignee === user?.id);

    useEffect(() => {
        if (!user) return;

        if (mode === 'personal') {
            dispatch(fetchPersonalTasks());
        } else if (currentCommunity?.id) {
            dispatch(fetchTasks(currentCommunity.id));
        }
    }, [dispatch, user, mode, currentCommunity?.id]);

    // Auto-open task from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const taskId = params.get('task');
        if (taskId && visibleTasks.length > 0) {
            const t = visibleTasks.find((x) => x.id === taskId);
            if (t) setSelectedTask(t);
        }
    }, [location.search, visibleTasks]);

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

    const handleTaskClick = (task) => setSelectedTask(task);

    const handleSaveTask = async (updates) => {
        if (!selectedTask) return;
        try {
            const res = await dispatch(updateTask({ taskId: selectedTask.id, data: updates }));
            if (updateTask.fulfilled.match(res)) {
                setSelectedTask(res.payload);
            }
        } catch (err) {
            console.error('Update task failed', err);
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        try {
            const res = await dispatch(deleteTask(selectedTask.id));
            if (deleteTask.fulfilled.match(res)) {
                setSelectedTask(null);
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

        if (lastAt !== -1 && (cursorPos === value.length || value[cursorPos] === ' ')) {
            const query = textBeforeCursor.substring(lastAt + 1).trim();
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
            const hay = ((m.name || m.username || m.email || '') + '').toLowerCase();
            const q = (mentionQuery || '').toLowerCase();
            return hay.includes(q);
        })
        .slice(0, 6);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTask) return;

        const optimisticComment = {
            id: `temp-${Date.now()}`,
            user: 'You',
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
                        const resp = await api.post('/alerts/', {
                            type: 'mention',
                            message: `You were mentioned in task "${selectedTask.title}"`,
                            user: member.id,
                            task: selectedTask.id,
                            read: false,
                        });

                        dispatch(addNotification(resp.data));
                    } catch (err) {
                        console.warn('Failed to create mention alert', err);
                        dispatch(
                            addNotification({
                                id: `local-${Date.now()}`,
                                type: 'mention',
                                message: `You were mentioned in task "${selectedTask.title}"`,
                                task: selectedTask.id,
                                user: member.id,
                                read: false,
                                timestamp: new Date().toISOString(),
                            })
                        );
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

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <p className="text-gray-500 animate-pulse flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading tasks...
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {mode === 'personal' ? 'My Personal Tasks' : 'My Assigned Tasks'}
                    </h1>
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <FiPlus size={18} /> Create Task
                    </button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(e) => setActiveId(e.active.id)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-6 overflow-x-auto pb-10">
                        {columns.map((column) => {
                            const columnTasks = visibleTasks.filter((t) => t.status === column.id);

                            return (
                                <div key={column.id} className="flex-shrink-0 w-80 min-w-[20rem]">
                                    <div className="bg-white/80 backdrop-blur-md rounded-t-2xl px-6 py-4 border border-gray-200 shadow-sm flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800 uppercase text-sm tracking-wide">
                                            {column.title}
                                        </h3>
                                        <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-700 rounded-full shadow-sm">
                                            {columnTasks.length}
                                        </span>
                                    </div>

                                    <SortableContext
                                        items={columnTasks.map((t) => t.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="bg-gray-50/70 min-h-[60vh] rounded-b-2xl p-5 space-y-4 border border-gray-200 border-t-0">
                                            {columnTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onClick={() => handleTaskClick(task)}
                                                />
                                            ))}

                                            {columnTasks.length === 0 && (
                                                <div className="text-center text-gray-400 py-16 italic text-sm">
                                                    {mode === 'personal'
                                                        ? "You don't have any personal tasks here yet"
                                                        : "No tasks assigned to you in this column"}
                                                </div>
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>
                            );
                        })}
                    </div>

                    <DragOverlay>
                        {activeId && <TaskCard task={visibleTasks.find((t) => t.id === activeId)} isDragging />}
                    </DragOverlay>
                </DndContext>

                <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

                {/* Task Detail Panel */}
                {selectedTask && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out"
                            onClick={() => setSelectedTask(null)}
                            role="button"
                            tabIndex={-1}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setSelectedTask(null);
                            }}
                            aria-label="Close panel"
                        />

                        {/* Slide-in Panel */}
                        <div className="fixed right-0 top-0 h-screen w-[420px] max-w-[90vw] bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
                            {/* Header */}
                            <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
                                <div className="flex justify-between items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={selectedTask.title}
                                            onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                                            className="w-full text-2xl font-bold text-gray-900 truncate focus:outline-none"
                                        />
                                        <div className="text-sm text-gray-500 mt-1">
                                            <select
                                                value={selectedTask.status}
                                                onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                                                className="rounded-md border px-2 py-1 mr-2"
                                            >
                                                {['backlog', 'To Do', 'In Progress', 'Review', 'Done'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={selectedTask.assignee || ''}
                                                onChange={(e) => setSelectedTask({ ...selectedTask, assignee: e.target.value })}
                                                className="rounded-md border px-2 py-1"
                                            >
                                                <option value="">Unassigned</option>
                                                {realUsers.map(u => (
                                                    <option key={u.id} value={u.id}>{u.username || u.email}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleSaveTask({
                                                title: selectedTask.title,
                                                status: selectedTask.status,
                                                assignee: selectedTask.assignee || null,
                                            })}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleDeleteTask}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => setSelectedTask(null)}
                                            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200 flex-shrink-0"
                                            aria-label="Close panel"
                                        >
                                            <FiX size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="mb-10">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3 break-words">
                                        {selectedTask.title}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                        {selectedTask.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="mb-12">
                                    <h4 className="text-lg font-semibold text-indigo-700 mb-5 flex items-center gap-2">
                                        <FiActivity size={20} />
                                        Activity Log
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedTask.activity_logs?.length > 0 ? (
                                            selectedTask.activity_logs.map((log, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <p className="text-sm text-gray-800">
                                                        <span className="font-medium text-indigo-600">@user</span>{' '}
                                                        {log.action || 'updated the task'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(log.timestamp || Date.now()).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-8 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                No activity logged yet
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-indigo-700 mb-5 flex items-center gap-2">
                                        <FiSend size={20} style={{ transform: 'rotate(-20deg)' }} />
                                        Comments
                                    </h4>

                                    <div className="space-y-4 mb-8">
                                        {selectedTask.comments?.length > 0 ? (
                                            selectedTask.comments.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 text-sm">
                                                        {comment.user?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline gap-3 flex-wrap">
                                                            <span className="font-semibold text-gray-900">
                                                                {comment.user || 'Anonymous'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(comment.timestamp).toLocaleString([], {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1.5 text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                                            {comment.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                                <p className="text-gray-500 italic">No comments yet — be the first!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-6" />
                            </div>

                            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-lg flex-shrink-0">
                                <form onSubmit={handleAddComment} className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={handleCommentChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base placeholder:text-gray-500 pr-14"
                                            placeholder="Write a comment or @mention..."
                                        />

                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${newComment.trim()
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            aria-label="Send comment"
                                        >
                                            <FiSend size={18} />
                                        </button>
                                    </div>

                                    {showMentions && filteredMembers.length > 0 && (
                                        <div className="absolute bottom-full left-0 mb-3 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-30 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                            {filteredMembers.map((member) => (
                                                <button
                                                    key={member.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        insertMention(
                                                            member.name || member.username || member.email?.split('@')[0]
                                                        );
                                                    }}
                                                    className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-150 flex items-center gap-4 border-b border-gray-100 last:border-b-0 group"
                                                >
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 text-sm group-hover:shadow-lg transition-shadow">
                                                        {(
                                                            member.name ||
                                                            member.username ||
                                                            member.email?.[0] ||
                                                            '?'
                                                        ).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {member.name || member.username}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
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
        </PageWrapper>
    );
}