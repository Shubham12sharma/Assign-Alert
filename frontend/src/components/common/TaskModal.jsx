import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../store/taskSlice';
import { addNotification } from '../../store/notificationSlice';

const priorities = ['Low', 'Medium', 'High'];
const levels = ['Easy', 'Medium', 'Hard'];
const categories = ['Bug', 'Feature', 'Research', 'Documentation', 'Design', 'Deployment'];
const statuses = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'todo', label: 'To Do' },
    { id: 'inProgress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
];

// Mock users – replace with real data from API later
const mockUsers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Alice Chen' },
    { id: '4', name: 'Bob Wilson' },
];

export default function TaskModal({ isOpen, onClose, mode = 'create', initialData = null }) {
    const dispatch = useDispatch();
    const { epics = [] } = useSelector((state) => state.epic || {});
    const { sprints = [] } = useSelector((state) => state.sprint || {});
    const { currentCommunity } = useSelector((state) => state.community || {});

    const [loading, setLoading] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [showUserSuggestions, setShowUserSuggestions] = useState(false);
    const [userQuery, setUserQuery] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        taskLevel: 'Medium',
        category: 'Feature',
        status: 'To Do',
        assignee: '',
        dueDate: '',
        estimatedHours: '',
        tags: [],
        sprintId: '',
        epicId: '',
        communityId: '',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
                setForm({
                    title: '',
                    description: '',
                    priority: 'Medium',
                    taskLevel: 'Medium',
                    category: 'Feature',
                    status: currentCommunity ? 'todo' : 'backlog',
                    assignee: '',
                    dueDate: '',
                    estimatedHours: '',
                    tags: [],
                    sprintId: '',
                    epicId: '',
                    communityId: currentCommunity?.id || '',
                });
            setNewTag('');
        }
    }, [isOpen, currentCommunity]);

    const handleAddTag = (e) => {
        e.preventDefault();
        const trimmed = newTag.trim();
        if (!trimmed) return;

        // If user typed @name and selected suggestion, it will already be in the correct form.
        // If it starts with @ but wasn't selected, try to match a user by query
        if (trimmed.startsWith('@')) {
            const q = trimmed.slice(1).toLowerCase();
            const matched = mockUsers.find(u => u.name.toLowerCase().includes(q));
            const tagValue = matched ? `@${matched.name}` : trimmed;
            if (!form.tags.includes(tagValue)) {
                setForm({ ...form, tags: [...form.tags, tagValue] });
            }
        } else {
            if (!form.tags.includes(trimmed)) {
                setForm({ ...form, tags: [...form.tags, trimmed] });
            }
        }
        setNewTag('');
        setShowUserSuggestions(false);
        setUserQuery('');
    };
    
    const handleRemoveTag = (tagToRemove) => {
        setForm({ ...form, tags: form.tags.filter((t) => t !== tagToRemove) });
    };

    const handleAISuggest = () => {
        // Future: Call LLM API
        setForm({
            ...form,
            priority: 'High',
            category: 'Feature',
            estimatedHours: '12',
            tags: ['AI', 'urgent', 'backend', 'priority'],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.dueDate) return;

        setLoading(true);
        try {
            const created = await dispatch(createTask(form)).unwrap();

            // Dispatch notifications for any @-tagged users
            (created.tags || []).forEach((tag) => {
                if (typeof tag === 'string' && tag.startsWith('@')) {
                    const username = tag.slice(1);
                    dispatch(addNotification({
                        type: 'mention',
                        message: `Current User tagged you in task #${created.id}: "${created.title}"`,
                        taskId: created.id,
                        mentionedUser: username,
                    }));
                }
            });

            onClose();
        } catch (err) {
            console.error('Failed to create task:', err);
            // Future: Show toast error
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = mockUsers.filter(u => u.name.toLowerCase().includes(userQuery.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900">Create New Task</h2>
                    <p className="text-gray-600 mt-2">Fill in task details with optional AI assistance</p>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                    {/* Task Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="e.g. Implement AI priority suggestion"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description (Markdown supported)
                        </label>
                        <textarea
                            rows={5}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 resize-none transition"
                            placeholder="Detailed description of what needs to be done..."
                        />
                    </div>

                    {/* Priority / Level / Category */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { key: 'priority', label: 'Priority', options: priorities },
                            { key: 'taskLevel', label: 'Task Level', options: levels },
                            { key: 'category', label: 'Category', options: categories },
                        ].map(({ key, label, options }) => (
                            <div key={key}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                                <select
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                                >
                                    {options.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Status & Due Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                            >
                                {statuses.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                    </div>

                    {/* Assignee & Estimated Hours */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee</label>
                            <select
                                value={form.assignee}
                                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                            >
                                <option value="">Unassigned</option>
                                {mockUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Hours</label>
                            <input
                                type="number"
                                min="1"
                                step="0.5"
                                value={form.estimatedHours}
                                onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="e.g. 8"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {form.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:bg-indigo-200 rounded-full w-6 h-6 flex items-center justify-center transition"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setNewTag(val);
                                    if (val.startsWith('@')) {
                                        setUserQuery(val.slice(1));
                                        setShowUserSuggestions(true);
                                    } else {
                                        setShowUserSuggestions(false);
                                        setUserQuery('');
                                    }
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                                className="flex-1 px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="Type tag and press Enter"
                            />
                            {showUserSuggestions && filteredUsers.length > 0 && (
                                <div className="absolute mt-2 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-60 overflow-y-auto">
                                    {filteredUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                const tagValue = `@${user.name}`;
                                                if (!form.tags.includes(tagValue)) {
                                                    setForm({ ...form, tags: [...form.tags, tagValue] });
                                                }
                                                setNewTag('');
                                                setShowUserSuggestions(false);
                                                setUserQuery('');
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {user.name[0]}
                                            </div>
                                            <span className="font-medium">{user.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
                            >
                                Add Tag
                            </button>
                        </div>
                    </div>

                    {/* Sprint & Epic Linking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Assign to Sprint
                            </label>
                            <select
                                value={form.sprintId}
                                onChange={(e) => setForm({ ...form, sprintId: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                            >
                                <option value="">No Sprint</option>
                                {sprints.map((sprint) => (
                                    <option key={sprint.id} value={sprint.id}>
                                        {sprint.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Link to Epic
                            </label>
                            <select
                                value={form.epicId}
                                onChange={(e) => setForm({ ...form, epicId: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                            >
                                <option value="">No Epic</option>
                                {epics.map((epic) => (
                                    <option key={epic.id} value={epic.id}>
                                        {epic.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-indigo-900">AI Task Assistant</h3>
                                <p className="text-indigo-700 mt-2">
                                    Let AI suggest priority, category, effort, and tags based on your description
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAISuggest}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 font-semibold shadow-lg transition flex items-center gap-3"
                            >
                                ✨ Get AI Suggestions
                            </button>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50 shadow-lg transition"
                        >
                            {loading ? 'Creating Task...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}