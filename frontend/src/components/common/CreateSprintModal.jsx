import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSprint, updateSprint } from '../../store/sprintSlice';

const sprintTypes = [
    { value: 'weekly', label: 'Weekly Sprint' },
    { value: 'monthly', label: 'Monthly Sprint' },
];

export default function SprintModal({
    isOpen,
    onClose,
    mode = 'create',       // 'create' | 'edit'
    initialData = null,    // sprint object when editing
    defaultEpicId = null,  // optional — if creating from epic page
}) {
    const dispatch = useDispatch();
    const { epics } = useSelector(state => state.epic);
    const { currentCommunity } = useSelector(state => state.community);

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [form, setForm] = useState({
        name: '',
        goal: '',
        type: 'Monthly',
        startDate: '',
        endDate: '',
        epic: '',
        retrospective: '',
    });

    // Fill form when opening / switching mode / receiving new initialData
    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && initialData) {
            setForm({
                name: initialData.name || '',
                goal: initialData.goal || '',
                type: initialData.type || 'Monthly',
                startDate: initialData.start_date
                    ? new Date(initialData.start_date).toISOString().split('T')[0]
                    : '',
                endDate: initialData.end_date
                    ? new Date(initialData.end_date).toISOString().split('T')[0]
                    : '',
                epic: initialData.epic || '',
                retrospective: initialData.retrospective || '',
            });
        } else {
            // create mode
            setForm({
                name: '',
                goal: '',
                type: 'Monthly',
                startDate: '',
                endDate: '',
                epic: defaultEpicId || '',
                retrospective: '',
            });
        }

        setFormError('');
    }, [isOpen, mode, initialData, defaultEpicId]);

    const validate = () => {
        if (!form.name.trim()) return 'Sprint name is required';
        if (!form.goal.trim()) return 'Sprint goal is required';
        if (!form.startDate) return 'Start date is required';
        if (!form.endDate) return 'End date is required';
        if (new Date(form.startDate) > new Date(form.endDate))
            return 'End date must be after start date';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errorMsg = validate();
        if (errorMsg) {
            setFormError(errorMsg);
            return;
        }

        setLoading(true);
        setFormError('');

        const payload = {
            name: form.name.trim(),
            goal: form.goal.trim(),
            // backend expects 'weekly' | 'monthly'
            type: form.type.toLowerCase(),
            start_date: `${form.startDate}T00:00:00Z`,
            end_date: `${form.endDate}T00:00:00Z`,
            epic: form.epic || null,
            community: currentCommunity || null,
            retrospective: form.retrospective.trim(),
        };

        try {
            if (mode === 'create') {
                await dispatch(createSprint(payload)).unwrap();
            } else if (initialData?.id) {
                await dispatch(updateSprint({
                    id: initialData.id,
                    updates: payload,
                })).unwrap();
            }
            onClose();
        } catch (err) {
            setFormError(err?.message || 'Could not save sprint');
            console.error('Sprint save failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const suggestGoal = () => {
        setForm(f => ({
            ...f,
            goal: 'Deliver valuable working software increment, complete committed stories with high quality, reduce technical debt, and improve team collaboration and velocity.',
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8 border-b">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {mode === 'create' ? 'Create New Sprint' : 'Edit Sprint'}
                    </h2>
                    <p className="text-gray-600 mt-1.5">
                        {mode === 'create'
                            ? 'Define clear objectives and timeline for the next sprint'
                            : 'Update sprint information and add retrospective notes'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {formError}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Sprint Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Q1 2026 – Platform Stabilization"
                        />
                    </div>

                    {/* Goal */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Sprint Goal <span className="text-red-600">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={suggestGoal}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                                ✨ Suggest goal
                            </button>
                        </div>
                        <textarea
                            rows={3}
                            required
                            value={form.goal}
                            onChange={e => setForm({ ...form, goal: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[90px]"
                            placeholder="What is the main outcome you want to achieve in this sprint?"
                        />
                    </div>

                    {/* Type + Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Sprint Type
                            </label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                {sprintTypes.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Start Date <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.startDate}
                                onChange={e => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                End Date <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                min={form.startDate || undefined}
                                value={form.endDate}
                                onChange={e => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Epic */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Associated Epic (optional)
                        </label>
                        <select
                            value={form.epic}
                            onChange={e => setForm({ ...form, epic: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">— No epic —</option>
                            {epics.map(epic => (
                                <option key={epic.id} value={epic.id}>
                                    {epic.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Retrospective – only edit */}
                    {mode === 'edit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Retrospective
                            </label>
                            <textarea
                                rows={4}
                                value={form.retrospective}
                                onChange={e => setForm({ ...form, retrospective: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[110px]"
                                placeholder="What went well? What should we do differently next time?"
                            />
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-5 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-7 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition disabled:opacity-60"
                        >
                            {loading ? 'Saving…' : mode === 'create' ? 'Create Sprint' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}