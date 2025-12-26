import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSprint, updateSprint } from '../../store/sprintSlice'; // You'll add updateSprint below

const sprintTypes = [
    { value: 'monthly', label: 'Monthly Sprint' },
    { value: 'weekly', label: 'Weekly Sprint' },
];

export default function SprintModal({ isOpen, onClose, mode = 'create', initialData = null }) {
    const dispatch = useDispatch();
    const { epics } = useSelector((state) => state.epic);
    const { currentCommunity } = useSelector((state) => state.community);
    const [loading, setLoading] = useState(false);

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
                    type: initialData.type || 'monthly',
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                    epicId: initialData.epicId || '',
                    communityId: initialData.communityId || currentCommunity?.id || '',
                    retrospective: initialData.retrospective || '',
                });
            } else {
                // Create mode – reset form
                setForm({
                    name: '',
                    goal: '',
                    type: 'monthly',
                    startDate: '',
                    endDate: '',
                    epicId: '',
                    communityId: currentCommunity?.id || '',
                    retrospective: '',
                });
            }
        }
    }, [isOpen, mode, initialData, currentCommunity]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.startDate || !form.endDate) return;

        setLoading(true);

        if (mode === 'create') {
            await dispatch(createSprint(form));
        } else if (mode === 'edit' && initialData?.id) {
            await dispatch(updateSprint({ id: initialData.id, updates: form }));
        }

        setLoading(false);
        onClose();
    };

    const handleAIGoal = () => {
        // Placeholder for future AI integration
        setForm({
            ...form,
            goal: 'Deliver high-quality features with improved velocity, complete all planned stories, and ensure thorough testing before sprint end.',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
                <div className="p-8 border-b border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {mode === 'create' ? 'Create New Sprint' : 'Edit Sprint'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {mode === 'create'
                            ? 'Plan your next sprint with clear goals and timeline'
                            : 'Update sprint details, goals, and retrospective'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Sprint Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sprint Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                            placeholder="e.g. December 2025 Monthly Sprint"
                        />
                    </div>

                    {/* Goal */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                                Sprint Goal <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleAIGoal}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition"
                            >
                                ✨ AI Suggest Goal
                            </button>
                        </div>
                        <textarea
                            rows={4}
                            required
                            value={form.goal}
                            onChange={(e) => setForm({ ...form, goal: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 resize-none transition"
                            placeholder="What is the primary objective of this sprint?"
                        />
                    </div>

                    {/* Type & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sprint Type
                            </label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
                            >
                                {sprintTypes.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.endDate}
                                min={form.startDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
                            />
                        </div>
                    </div>

                    {/* Epic Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link to Epic (Optional)
                        </label>
                        <select
                            value={form.epicId}
                            onChange={(e) => setForm({ ...form, epicId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 transition"
                        >
                            <option value="">No Epic</option>
                            {epics.map((epic) => (
                                <option key={epic.id} value={epic.id}>
                                    {epic.title}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            Linking helps track epic-level progress and roadmap alignment
                        </p>
                    </div>

                    {/* Retrospective Notes – Only in Edit Mode */}
                    {mode === 'edit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Retrospective Notes
                            </label>
                            <textarea
                                rows={5}
                                value={form.retrospective}
                                onChange={(e) => setForm({ ...form, retrospective: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 resize-none transition"
                                placeholder="What went well? What could be improved? Key learnings..."
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Share insights to improve future sprints
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 shadow-lg transition"
                        >
                            {loading ? 'Saving...' : mode === 'create' ? 'Create Sprint' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}