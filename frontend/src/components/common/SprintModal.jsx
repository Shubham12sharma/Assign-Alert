import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSprint, updateSprint } from '../../store/sprintSlice';
import { FiX, FiCalendar, FiTarget, FiEdit3, FiCpu } from 'react-icons/fi';

const sprintTypes = [
    { value: 'monthly', label: 'Monthly Sprint' },
    { value: 'weekly', label: 'Weekly Sprint' },
];

export default function SprintModal({ isOpen, onClose, mode = 'create', initialData = null }) {
    const dispatch = useDispatch();
    const { epics } = useSelector((state) => state.epic);
    const { currentCommunity } = useSelector((state) => state.community);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        goal: '',
        type: 'monthly',
        startDate: '',
        endDate: '',
        epicId: '',
        communityId: '',
        retrospective: '',
    });

    // Initialize form on open or when initialData changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setForm({
                    name: initialData.name || '',
                    goal: initialData.goal || '',
                    type: (initialData.type || 'monthly').toLowerCase(),
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                    epicId: initialData.epicId || '',
                    communityId: initialData.communityId || currentCommunity || '',
                    retrospective: initialData.retrospective || '',
                });
            } else {
                setForm({
                    name: '',
                    goal: '',
                    type: 'monthly',
                    startDate: '',
                    endDate: '',
                    epicId: '',
                    communityId: currentCommunity || '',
                    retrospective: '',
                });
            }
            setError('');
        }
    }, [isOpen, mode, initialData, currentCommunity]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!form.name.trim()) {
            setError('Sprint name is required');
            return;
        }
        if (!form.goal.trim()) {
            setError('Sprint goal is required');
            return;
        }
        if (!form.startDate) {
            setError('Start date is required');
            return;
        }
        if (!form.endDate) {
            setError('End date is required');
            return;
        }
        if (new Date(form.startDate) >= new Date(form.endDate)) {
            setError('End date must be after start date');
            return;
        }

        setLoading(true);

        const payload = {
            name: form.name.trim(),
            goal: form.goal.trim(),
            type: form.type,
            start_date: `${form.startDate}T00:00:00Z`,
            end_date: `${form.endDate}T00:00:00Z`,
            epic: form.epicId || null,
            community: form.communityId || null,
            retrospective: form.retrospective?.trim() || '',
        };

        try {
            if (mode === 'create') {
                await dispatch(createSprint(payload)).unwrap();
            } else if (mode === 'edit' && initialData?.id) {
                await dispatch(updateSprint({ id: initialData.id, updates: payload })).unwrap();
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save sprint');
        } finally {
            setLoading(false);
        }
    };

    const handleAIGoal = () => {
        setForm({
            ...form,
            goal: 'Deliver high-quality features with improved velocity, complete all planned stories, and ensure thorough testing before sprint end.',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto px-4 py-8">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col min-h-0 max-h-full">
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {mode === 'create' ? 'Create New Sprint' : 'Edit Sprint'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {mode === 'create'
                                    ? 'Plan your next sprint with clear goals and timeline'
                                    : 'Update sprint details, goals, and retrospective'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            aria-label="Close modal"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Form - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Sprint Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Sprint Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                placeholder="e.g. December 2025 Monthly Sprint"
                            />
                        </div>

                        {/* Goal with AI Button */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Sprint Goal <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAIGoal}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition"
                                >
                                    <FiCpu size={14} />
                                    AI Suggest
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                required
                                value={form.goal}
                                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition text-sm"
                                placeholder="What is the primary objective of this sprint?"
                            />
                        </div>

                        {/* Type & Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Sprint Type
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                >
                                    {sprintTypes.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={form.endDate}
                                    min={form.startDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                                />
                            </div>
                        </div>

                        {/* Epic Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                                <FiTarget size={14} className="text-indigo-600" />
                                Link to Epic (Optional)
                            </label>
                            <select
                                value={form.epicId}
                                onChange={(e) => setForm({ ...form, epicId: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                            >
                                <option value="">No Epic</option>
                                {epics.map((epic) => (
                                    <option key={epic.id} value={epic.id}>
                                        {epic.title}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1.5">
                                Linking helps track epic-level progress and roadmap alignment
                            </p>
                        </div>

                        {/* Retrospective Notes – Only in Edit Mode */}
                        {mode === 'edit' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                                    <FiEdit3 size={14} className="text-indigo-600" />
                                    Retrospective Notes
                                </label>
                                <textarea
                                    rows={4}
                                    value={form.retrospective}
                                    onChange={(e) => setForm({ ...form, retrospective: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition text-sm"
                                    placeholder="What went well? What could be improved? Key learnings..."
                                />
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Share insights to improve future sprints
                                </p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition text-sm flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                mode === 'create' ? 'Create Sprint' : 'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}