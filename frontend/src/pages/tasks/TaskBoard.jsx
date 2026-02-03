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
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchTasks, updateTaskStatus, addCommentToTask } from '../../store/taskSlice';
import TaskModal from '../../components/common/TaskModal';
import { FiUser, FiSend, FiActivity, FiX } from 'react-icons/fi';
import { addNotification } from '../../store/notificationSlice';

const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'To Do', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Review', title: 'Review' },
    { id: 'Done', title: 'Done' },
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

function TaskCard({ task, isDragging, onClick }) {
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
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-indigo-300"
        >
            <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h4>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                >
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
                    <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
                    <circle cx="8" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
                    <circle cx="16" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
                    <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
                    <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
                </svg>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[task.category] || categoryColors.default
                        }`}
                >
                    {task.category || 'Uncategorized'}
                </span>
                {task.tags?.map((tag, idx) => (
                    <span
                        key={tag}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColors[idx % tagColors.length]
                            }`}
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between text-sm">
                <span
                    className={`font-medium px-2.5 py-1 rounded-full ${priorityColor[task.priority] || 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {task.priority || 'Medium'}
                </span>
                <div className="flex items-center text-gray-600">
                    <FiUser className="mr-1.5" />
                    <span>
                        {task.assignee
                            ? `User ${task.assignee.slice(0, 8)}${task.assignee.length > 8 ? '...' : ''}`
                            : 'Unassigned'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function TaskBoard() {
    const dispatch = useDispatch();
    const { tasks, loading } = useSelector((state) => state.task);
    const { currentCommunity } = useSelector((state) => state.community); // ← real users from community
    const { mode } = useSelector((state) => state.auth);
    const realUsers = useSelector(state => state.community.realUsers || []);
    const [activeId, setActiveId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionPos, setMentionPos] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Load tasks
    useEffect(() => {
        if (mode === 'personal') {
            dispatch(fetchPersonalTasks());
        } else if (currentCommunity?.id) {
            dispatch(fetchTasks(currentCommunity.id));
        }
    }, [dispatch, currentCommunity?.id, mode]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t.id === active.id);
        if (!activeTask) return;

        const overColumnId =
            columns.find((c) => c.id === over.id)?.id ||
            tasks.find((t) => t.id === over.id)?.status;

        if (overColumnId && activeTask.status !== overColumnId) {
            dispatch(updateTaskStatus({ taskId: activeTask.id, status: overColumnId }));
        }

        setActiveId(null);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
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

    const insertMention = (username) => {
        const before = newComment.substring(0, mentionPos);
        const after = newComment.substring(mentionPos + 1 + mentionQuery.length);
        setNewComment(`${before}@${username} ${after}`);
        setShowMentions(false);
        setMentionQuery('');
    };

    // Use real community members for mentions
    const filteredMembers = realUsers
        .filter((user) =>
            (user.name || user.username || user.email || '')
                .toLowerCase()
                .includes(mentionQuery.toLowerCase())
        )
        .slice(0, 6); // limit to 6 suggestions

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTask) return;

        const optimisticComment = {
            id: `temp-${Date.now()}`,
            user: 'You', // or current user name from auth
            text: newComment.trim(),
            timestamp: new Date().toISOString(),
        };

        // Optimistic UI update
        setSelectedTask(prev => ({
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

            // Replace optimistic comment with real one
            setSelectedTask(prev => ({
                ...prev,
                comments: (prev.comments || []).map(c =>
                    c.id.startsWith('temp-') ? comment : c
                ),
            }));

            // Handle mentions
            const mentions = newComment.match(/@([a-zA-Z0-9_]+)/g) || [];
            mentions.forEach(mention => {
                const username = mention.slice(1);
                dispatch(
                    addNotification({
                        type: 'mention',
                        message: `You were mentioned in task "${selectedTask.title}"`,
                        taskId: selectedTask.id,
                        mentionedUser: username,
                    })
                );
            });
        } else {
            // Rollback optimistic update on error
            setSelectedTask(prev => ({
                ...prev,
                comments: prev.comments?.filter(c => !c.id.startsWith('temp-')) || [],
            }));
        }

        setNewComment('');
    };

    const getTasksByStatus = (status) => tasks.filter((task) => task.status === status);

    const activeTask = tasks.find((t) => t.id === activeId);

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500 animate-pulse">Loading tasks...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Task Kanban Board</h1>
                <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
                >
                    + Create Task
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex space-x-6 overflow-x-auto pb-8">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-shrink-0 w-80 min-w-[20rem]">
                            <div className="bg-gray-100/80 backdrop-blur-sm rounded-t-xl px-5 py-4 flex items-center justify-between border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800 uppercase text-sm tracking-wide">
                                    {column.title}
                                </h3>
                                <span className="text-sm font-medium text-gray-600 bg-white px-2.5 py-1 rounded-full shadow-sm">
                                    {getTasksByStatus(column.id).length}
                                </span>
                            </div>

                            <SortableContext
                                items={getTasksByStatus(column.id).map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="bg-gray-50/50 min-h-[60vh] rounded-b-xl p-4 space-y-4 border border-t-0 border-gray-200">
                                    {getTasksByStatus(column.id).map((task) => (
                                        <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                                    ))}

                                    {getTasksByStatus(column.id).length === 0 && (
                                        <div className="text-center text-gray-500 py-12 italic">
                                            No tasks in this column yet
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    ))}
                </div>

                <DragOverlay>
                    {activeTask && <TaskCard task={activeTask} isDragging />}
                </DragOverlay>
            </DndContext>

            {/* Create Task Modal */}
            <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

            {/* Right-Side Task Detail Panel */}
            {selectedTask && (
                <div className="fixed right-0 top-0 h-screen w-[420px] bg-white shadow-2xl overflow-hidden z-50 border-l border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Task #{selectedTask.id.slice(0, 8)}
                            </h2>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition"
                            >
                                <FiX className="text-2xl" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 pb-32">
                        <div className="mt-6 mb-10">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{selectedTask.title}</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedTask.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Activity Log */}
                        <div className="mb-12">
                            <h4 className="text-lg font-semibold text-indigo-700 mb-5 flex items-center gap-2">
                                <FiActivity className="text-xl" />
                                Activity Log
                            </h4>
                            <div className="space-y-4">
                                {selectedTask.activity_logs?.length > 0 ? (
                                    selectedTask.activity_logs.map((log, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <p className="text-sm text-gray-800">
                                                <span className="font-medium text-indigo-600">@user</span> {log.action || 'updated the task'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(log.timestamp || Date.now()).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-8 italic bg-gray-50 rounded-xl">
                                        No activity logged yet
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <h4 className="text-lg font-semibold text-indigo-700 mb-5 flex items-center gap-2">
                                <FiSend className="text-xl rotate-[-20deg]" />
                                Comments
                            </h4>

                            <div className="space-y-6 mb-8">
                                {selectedTask.comments?.length > 0 ? (
                                    selectedTask.comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 text-lg">
                                                {comment.user?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-3">
                                                    <span className="font-semibold text-gray-900">{comment.user || 'Anonymous'}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(comment.timestamp).toLocaleString([], {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="mt-1.5 text-gray-700 leading-relaxed whitespace-pre-wrap">
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
                    </div>

                    {/* Sticky Input */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                        <form onSubmit={handleAddComment} className="relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={handleCommentChange}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner text-base placeholder:text-gray-500"
                                placeholder="Write a comment or @mention someone..."
                            />

                            {showMentions && filteredMembers.length > 0 && (
                                <div className="absolute bottom-full left-0 mb-3 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-30 max-h-80 overflow-y-auto">
                                    {filteredMembers.map((member) => (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => insertMention(member.name || member.username || member.email?.split('@')[0])}
                                            className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 transition flex items-center gap-4 border-b last:border-b-0"
                                        >
                                            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 text-lg">
                                                {(member.name || member.username || member.email?.[0] || '?').toUpperCase()}
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

                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${newComment.trim()
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <FiSend className={newComment.trim() ? '' : 'opacity-50'} />
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}