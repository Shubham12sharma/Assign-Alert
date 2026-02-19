import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { fetchEpics, setCurrentEpic } from '../../store/epicSlice';
import { FiTarget, FiCalendar, FiTrendingUp, FiPlus } from 'react-icons/fi';
import CreateEpicModal from '../../components/common/CreateEpicModal';

const statusColors = {
    planned: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

const colorClasses = {
    indigo: 'border-l-indigo-600',
    purple: 'border-l-purple-600',
    blue: 'border-l-blue-600',
    green: 'border-l-green-600',
    red: 'border-l-red-600',
    yellow: 'border-l-yellow-600',
};

export default function EpicList() {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { epics, loading } = useSelector((state) => state.epic);
    const { currentCommunity } = useSelector((state) => state.community);

    useEffect(() => {
        if (currentCommunity) {
            dispatch(fetchEpics({ community: currentCommunity }));
        }
    }, [dispatch, currentCommunity]);

    const handleEpicClick = (epic) => {
        dispatch(setCurrentEpic(epic));
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500 animate-pulse flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Loading epics...</span>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Epics</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                High-level goals containing multiple sprints
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm transition-colors"
                        >
                            <FiPlus size={16} />
                            Create Epic
                        </button>
                    </div>

                    {/* Epics Grid */}
                    {epics.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                            <FiTarget className="mx-auto text-5xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No epics yet</h3>
                            <p className="text-sm text-gray-500 mb-6">Create your first epic to define a major goal</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 font-medium text-sm inline-flex items-center gap-2"
                            >
                                <FiPlus size={14} />
                                Create Epic
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {epics.map((epic) => (
                                <Link
                                    key={epic.id}
                                    to={`/epics/${epic.id}`}
                                    onClick={() => handleEpicClick(epic)}
                                    className="block"
                                >
                                    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 ${colorClasses[epic.color] || 'border-l-indigo-600'} border border-gray-200 h-full`}>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">{epic.title}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[epic.status]}`}>
                                                    {epic.status?.replace('_', ' ').toUpperCase() || 'PLANNED'}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{epic.description}</p>

                                            <div className="space-y-3">
                                                {/* Progress Bar */}
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-600">Progress</span>
                                                        <span className="font-medium text-indigo-600">{epic.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${epic.progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-3 gap-3 pt-2">
                                                    <div className="text-center">
                                                        <FiCalendar className="mx-auto text-gray-400 mb-1" size={14} />
                                                        <p className="text-[10px] text-gray-500">Timeline</p>
                                                        <p className="text-xs font-medium text-gray-700">
                                                            {new Date(epic.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                                                            {new Date(epic.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <FiTrendingUp className="mx-auto text-gray-400 mb-1" size={14} />
                                                        <p className="text-[10px] text-gray-500">Sprints</p>
                                                        <p className="text-xs font-medium text-gray-700">
                                                            {epic.completedSprints || 0}/{epic.sprintCount || 0}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="w-8 h-8 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            {epic.leadName?.[0] || '?'}
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 mt-1">Lead</p>
                                                        <p className="text-xs font-medium text-gray-700 truncate">
                                                            {epic.leadName || 'You'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Create Epic Modal */}
                    <CreateEpicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                </div>
            </div>
        </PageWrapper>
    );
}