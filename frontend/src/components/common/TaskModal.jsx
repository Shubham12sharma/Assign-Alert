import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../store/taskSlice';
import { setCommunityMembers } from '../../store/communitySlice';
import api from '../../api/api';

const priorities = ['Low', 'Medium', 'High'];
const levels = ['Easy', 'Medium', 'Hard'];

const statuses = [
    { id: 'To Do', label: 'To Do' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Review', label: 'Review' },
    { id: 'Done', label: 'Done' },
];

const corporateCategories = ['Bug', 'Feature', 'Research', 'Documentation', 'Design', 'Deployment'];
const personalCategories = ['Health', 'Family', 'Learning', 'Finance', 'Home', 'Shopping', 'Self-Improvement', 'Hobbies'];

const categoryColors = {
    Bug: 'bg-red-100 text-red-800',
    Feature: 'bg-blue-100 text-blue-800',
    Research: 'bg-yellow-100 text-yellow-800',
    Documentation: 'bg-gray-100 text-gray-800',
    Design: 'bg-purple-100 text-purple-800',
    Deployment: 'bg-green-100 text-green-800',
    Health: 'bg-emerald-100 text-emerald-800', // Fixed: was emerald-100-800
    Family: 'bg-pink-100 text-pink-800',
    Learning: 'bg-indigo-100 text-indigo-800',
    Finance: 'bg-amber-100 text-amber-800',
    Home: 'bg-orange-100 text-orange-800',
    Shopping: 'bg-cyan-100 text-cyan-800',
    'Self-Improvement': 'bg-purple-100 text-purple-800',
    Hobbies: 'bg-lime-100 text-lime-800',
    default: 'bg-gray-100 text-gray-800',
};

export default function TaskModal({ isOpen, onClose, mode = 'create', initialData = null, defaultSprintId = '' }) {
    const dispatch = useDispatch();

    const { epics = [] } = useSelector((state) => state.epic || {});
    const { sprints = [] } = useSelector((state) => state.sprint || {});

    // IMPORTANT: currentCommunity here is likely the ID string (from sidebar dispatch)
    const currentCommunityId = useSelector((state) => state.community.currentCommunity);

    const { mode: appMode } = useSelector((state) => state.auth || {});
    const categories = appMode === 'personal' ? personalCategories : corporateCategories;

    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        task_level: 'Medium',
        category: categories[0] || 'Feature',
        status: 'To Do',
        assignee: '',
        due_date: '',
        estimated_hours: '',
        tags: [],
        sprintId: '',
        epicId: '',
        community: currentCommunityId || '',
    });

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [newTag, setNewTag] = useState('');
    const [showUserSuggestions, setShowUserSuggestions] = useState(false);
    const [userQuery, setUserQuery] = useState('');

    const [realUsers, setRealUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState('');

    // Fetch members when modal opens and we have a community ID
    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && initialData) {
            // ── Edit / view mode ── load existing task
            setForm({
                title: initialData.title || '',
                description: initialData.description || '',
                priority: initialData.priority || 'Medium',
                task_level: initialData.task_level || 'Medium',
                category: initialData.category || categories[0] || 'Feature',
                status: initialData.status || 'To Do',
                // Very important lines:
                assignee: initialData.assignee || '',               // ← usually string id
                // If backend returns nested object → use: initialData.assignee?.id || ''
                due_date: initialData.due_date
                    ? initialData.due_date.split('T')[0]            // ISO → date input format
                    : '',
                estimated_hours: initialData.estimated_hours ?? '',
                tags: Array.isArray(initialData.tags) ? [...initialData.tags] : [],
                sprintId: initialData.sprint || initialData.sprintId || '',
                epicId: initialData.epic || initialData.epicId || '',
                community: initialData.community || currentCommunityId || '',
            });
        } else {
            // Create mode — defaults (your existing object)
            setForm({
                title: '',
                description: '',
                priority: 'Medium',
                task_level: 'Medium',
                category: categories[0] || 'Feature',
                status: currentCommunityId ? 'To Do' : 'backlog',
                assignee: '',
                due_date: '',
                estimated_hours: '',
                tags: [],
                sprintId: defaultSprintId || '',
                epicId: '',
                community: currentCommunityId || '',
            });
        }

        setNewTag('');
        setSubmitError('');
        setRealUsers([]);
        setUsersError('');

        if (!currentCommunityId) {
            setUsersError("Select a community first to see team members");
            return;
        }

        const fetchCommunityMembers = async () => {
            setUsersLoading(true);
            setUsersError('');
            try {
                console.log("[TaskModal] Fetching members for community ID:", currentCommunityId);
                const res = await api.get(`/users/minimal/?community=${currentCommunityId}`);
                console.log("[TaskModal] Members API response:", res.data);
                console.log("[TaskModal] Received", res.data?.length || 0, "users");
                // Ensure each user has a `name` field for UI (fallback to username/email)
                const members = (res.data || []).map(u => ({ ...u, name: u.name || u.username || u.email }));
                // update global slice (optional) and local state
                try {
                    dispatch(setCommunityMembers(members));
                } catch (e) {
                    // ignore if dispatch not needed or fails
                    console.warn('[TaskModal] dispatch setCommunityMembers failed', e);
                }
                setRealUsers(members);
            } catch (err) {
                console.error("[TaskModal] Failed to load community members:", err);
                setUsersError(err.response?.data?.detail || "Could not load team members");
            } finally {
                setUsersLoading(false);
            }
        };

        fetchCommunityMembers();
    }, [isOpen, currentCommunityId, categories, mode, initialData, defaultSprintId]);

    // ───────────────────────────────────────────────
    // Rest of your handlers remain unchanged
    // ───────────────────────────────────────────────

    const handleAddTag = (e) => {
        e.preventDefault();
        const trimmed = newTag.trim();
        if (!trimmed) return;

        let tagValue = trimmed;
        if (trimmed.startsWith('@')) {
            const q = trimmed.slice(1).toLowerCase();
            const matched = realUsers.find(u => u.name?.toLowerCase().includes(q));
            if (matched) tagValue = `@${matched.name}`;
        }

        if (!form.tags.includes(tagValue)) {
            setForm({ ...form, tags: [...form.tags, tagValue] });
        }

        setNewTag('');
        setShowUserSuggestions(false);
        setUserQuery('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setForm({ ...form, tags: form.tags.filter(t => t !== tagToRemove) });
    };

    const handleAISuggest = () => {
        setForm({
            ...form,
            priority: 'High',
            task_level: 'Hard',
            category: 'Feature',
            estimated_hours: '12',
            tags: ['AI', 'urgent', 'backend', 'priority'],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!form.title.trim()) {
            setSubmitError("Task title is required");
            return;
        }

        if (!form.due_date) {
            setSubmitError("Due date is required");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim() || "",
            priority: form.priority,
            task_level: form.task_level,
            category: form.category,
            status: form.status,
            assignee: form.assignee || null,
            due_date: form.due_date,
            estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
            tags: form.tags,
            attachments: [],
            comments: [],
            activity_logs: [],
            community: form.community || null,
            // Link task to sprint and epic on the backend
            sprint: form.sprintId || null,
            epic: form.epicId || null,
            is_personal: appMode === 'personal',
        };

        console.log("Sending task payload:", JSON.stringify(payload, null, 2));

        setLoading(true);

        try {
            const created = await dispatch(createTask(payload)).unwrap();
            console.log("Task created successfully:", created);
            onClose();
        } catch (err) {
            console.error("Create task error:", err);
            const backendError = err?.response?.data;

            if (backendError && typeof backendError === 'object') {
                const messages = Object.entries(backendError)
                    .map(([key, msgs]) => `${key}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
                setSubmitError(messages || "Validation failed");
            } else {
                setSubmitError(err.message || "Failed to create task");
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = realUsers.filter(u =>
        (u.name || u.username || u.email || '').toLowerCase().includes(userQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto px-4 py-8">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col min-h-0 max-h-full">
                {/* Header - Fixed */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {mode === 'edit' ? 'Update task details' : 'Fill in task details with optional AI assistance'}
                    </p>
                </div>

                {/* Scrollable Form */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {submitError && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                                {submitError}
                            </div>
                        )}

                        {/* Task Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Task Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                placeholder="e.g. Implement AI priority suggestion"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition text-sm"
                                placeholder="Detailed description..."
                            />
                        </div>

                        {/* Priority, Level, Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { key: 'priority', label: 'Priority', options: priorities },
                                { key: 'task_level', label: 'Task Level', options: levels },
                                { key: 'category', label: 'Category', options: categories },
                            ].map(({ key, label, options }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                                    <select
                                        value={form[key]}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                    >
                                        {options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Status & Due Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                >
                                    {statuses.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Due Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.due_date}
                                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Assignee & Estimated Hours */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignee</label>

                                {usersLoading ? (
                                    <p className="text-sm text-gray-500 animate-pulse py-2.5">Loading team members...</p>
                                ) : usersError ? (
                                    <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">{usersError}</p>
                                ) : !currentCommunityId ? (
                                    <p className="text-sm text-amber-700 bg-amber-50 p-2.5 rounded-lg">
                                        No community selected yet
                                    </p>
                                ) : realUsers.length === 0 ? (
                                    <p className="text-sm text-gray-500 bg-gray-50 p-2.5 rounded-lg">
                                        This community has no members yet
                                    </p>
                                ) : (
                                    <select
                                        value={form.assignee}
                                        onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                    >
                                        <option value="">Unassigned</option>
                                        {realUsers.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.username || user.email}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Hours</label>
                                <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={form.estimated_hours}
                                    onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                    placeholder="e.g. 8"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {form.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-medium"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center transition"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2 relative">
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
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                    placeholder="Type tag or @user and press Enter"
                                />
                                {showUserSuggestions && filteredUsers.length > 0 && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-60 overflow-y-auto">
                                        {filteredUsers.map(user => (
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
                                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition flex items-center gap-2 text-sm"
                                            >
                                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    {user.name?.[0] || '?'}
                                                </div>
                                                <span className="font-medium truncate">
                                                    {user.name || user.username || user.email}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition text-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Sprint & Epic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to Sprint</label>
                                <select
                                    value={form.sprintId}
                                    onChange={(e) => setForm({ ...form, sprintId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                >
                                    <option value="">No Sprint</option>
                                    {sprints.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link to Epic</label>
                                <select
                                    value={form.epicId}
                                    onChange={(e) => setForm({ ...form, epicId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                >
                                    <option value="">No Epic</option>
                                    {epics.map(e => (
                                        <option key={e.id} value={e.id}>{e.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* AI Assistant */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-indigo-900">AI Task Assistant</h3>
                                    <p className="text-sm text-indigo-700 mt-1">
                                        Let AI suggest priority, category, effort, and tags
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAISuggest}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow transition flex items-center gap-2 text-sm whitespace-nowrap"
                                >
                                    ✨ Get AI Suggestions
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 font-medium transition text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium disabled:opacity-50 shadow transition text-sm"
                        >
                            {loading ? 'Creating...' : mode === 'edit' ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}