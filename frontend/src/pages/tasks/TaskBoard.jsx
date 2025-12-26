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
import { FiUser, FiSend, FiActivity, FiX } from 'react-icons/fi'; // ← Add FiX here
import { addNotification } from '../../store/notificationSlice'; // ← ADD THIS LINE


const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
];
const communityMembers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Alice Chen' },
    { id: '4', name: 'Bob Wilson' },
    { id: '5', name: 'Sarah Lee' },
    { id: '6', name: 'Mike Johnson' },
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
            onClick={onClick}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition duration-200"
        >
            <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400 hover:text-gray-600"
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
    const [selectedTask, setSelectedTask] = useState(null);
    const [newComment, setNewComment] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // In your TaskBoard component state
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionPos, setMentionPos] = useState(0);

    // Handle @mentions
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

    const filteredMembers = communityMembers.filter(member =>
        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
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

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const result = await dispatch(addCommentToTask({
            taskId: selectedTask.id,
            comment: newComment.trim(),
        }));

        if (addCommentToTask.fulfilled.match(result)) {
            // Extract @mentions and notify
            const mentions = newComment.match(/@([a-zA-Z0-9_]+)/g) || [];
            mentions.forEach(mention => {
                const username = mention.slice(1);
                dispatch(addNotification({
                    type: 'mention',
                    message: `Current User mentioned you in task #${selectedTask.id}: "${selectedTask.title}"`,
                    taskId: selectedTask.id,
                    mentionedUser: username,
                }));
            });
        }

        setNewComment('');
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
                                        <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
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

            {/* Right-Side Task Detail Panel */}
            {selectedTask && (
                <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Task #{selectedTask.id}</h2>
                        <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-gray-700">
                            <FiX className="text-2xl" />
                        </button>
                    </div>

                    <p className="text-xl font-semibold mb-4">{selectedTask.title}</p>
                    <p className="text-gray-600 mb-8">{selectedTask.description}</p>

                    {/* Activity Log */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FiActivity className="text-indigo-600" />
                            Activity Log
                        </h3>
                        <div className="space-y-4">
                            {selectedTask.activityLogs?.map((log, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-medium text-indigo-600">@currentUser</span> {log.action}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                            {(!selectedTask.activityLogs || selectedTask.activityLogs.length === 0) && (
                                <p className="text-gray-500 text-center py-4">No activity yet</p>
                            )}
                        </div>
                    </div>

                    {/* Comments / Suggestions */}
                
                    <div className="relative">
                        <form onSubmit={handleAddComment} className="flex gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={handleCommentChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 pr-10"
                                    placeholder="Add a comment or @mention someone..."
                                />
                                {showMentions && filteredMembers.length > 0 && (
                                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-60 overflow-y-auto">
                                        {filteredMembers.map((member) => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => insertMention(member.name)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {member.name[0]}
                                                </div>
                                                <span className="font-medium">{member.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition"
                            >
                                <FiSend />
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}