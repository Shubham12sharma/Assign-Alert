import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEpic } from '../../store/epicSlice';

const colorOptions = [
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-600' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-600' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-600' },
    { value: 'green', label: 'Green', class: 'bg-green-600' },
    { value: 'red', label: 'Red', class: 'bg-red-600' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-600' },
];

const statusOptions = [
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

export default function CreateEpicModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { communities } = useSelector((state) => state.community);
    const { currentCommunity } = useSelector((state) => state.community);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'planned',
        color: 'indigo',
        startDate: '',
        targetDate: '',
        communityId: currentCommunity?.id || '',
    });

    // Flatten communities with indentation for hierarchy
    const communityOptions = [];
    communities.forEach((main) => {
        communityOptions.push({ id: main.id, name: main.name, indent: 0 });
        if (main.subCommunities) {
            main.subCommunities.forEach((sub) => {
                communityOptions.push({ id: sub.id, name: sub.name, indent: 1 });
                if (sub.subCommunities) {
                    sub.subCommunities.forEach((subSub) => {
                        communityOptions.push({ id: subSub.id, name: subSub.name, indent: 2 });
                    });
                }
            });
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.startDate || !form.targetDate || !form.communityId) return;

        setLoading(true);
        await dispatch(createEpic(form));
        setLoading(false);
        onClose();
        setForm({
            title: '',
            description: '',
            status: 'planned',
            color: 'indigo',
            startDate: '',
            targetDate: '',
            communityId: currentCommunity?.id || '',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Epic</h2>
                    <p className="text-gray-600 mt-1">Define a high-level goal for your organization</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Community Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Community <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={form.communityId}
                            onChange={(e) => setForm({ ...form, communityId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        >
                            <option value="">Select a community...</option>
                            {communityOptions.map((comm) => (
                                <option key={comm.id} value={comm.id}>
                                    {'—'.repeat(comm.indent * 2)} {comm.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Epics are scoped to a specific branch, department, or team
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Epic Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="e.g. AI-Powered Task Intelligence Platform"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                            placeholder="Describe the epic goal and expected outcomes..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.targetDate}
                                min={form.startDate}
                                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color Accent
                            </label>
                            <div className="flex space-x-3">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, color: color.value })}
                                        className={`w-12 h-12 rounded-lg ${color.class} ${form.color === color.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                                            } transition`}
                                        aria-label={color.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.communityId}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 shadow-md"
                        >
                            {loading ? 'Creating...' : 'Create Epic'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}