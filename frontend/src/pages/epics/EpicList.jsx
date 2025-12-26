import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { fetchEpics, setCurrentEpic } from '../../store/epicSlice';
import { FiTarget, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const statusColors = {
    planned: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

const epicColorClasses = {
    indigo: 'border-l-indigo-600',
    purple: 'border-l-purple-600',
    blue: 'border-l-blue-600',
    green: 'border-l-green-600',
};

export default function EpicList() {
    const dispatch = useDispatch();
    const { epics, loading } = useSelector((state) => state.epic);
    const { currentCommunity } = useSelector((state) => state.community);

    useEffect(() => {
        if (currentCommunity?.id) {
            dispatch(fetchEpics({ communityId: currentCommunity.id }));
        }
    }, [dispatch, currentCommunity]);

    const handleEpicClick = (epic) => {
        dispatch(setCurrentEpic(epic));
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500">Loading epics...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Epics</h1>
                    <p className="text-gray-600 mt-2">
                        High-level goals containing multiple sprints
                    </p>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium shadow-md">
                    + Create Epic
                </button>
            </div>

            {epics.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <FiTarget className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">No epics yet</h3>
                    <p className="text-gray-500 mt-2">Create your first epic to define a major goal</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {epics.map((epic) => (
                        <Link
                            key={epic.id}
                            to={`/epics/${epic.id}`}
                            onClick={() => handleEpicClick(epic)}
                            className="block"
                        >
                            <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 ${epicColorClasses[epic.color]} p-6 border border-gray-200`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{epic.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[epic.status]}`}>
                                        {epic.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-6">{epic.description}</p>

                                <div className="space-y-4">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Overall Progress</span>
                                            <span className="font-medium">{epic.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${epic.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <FiCalendar className="mx-auto text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">Timeline</p>
                                            <p className="font-semibold text-sm">
                                                {new Date(epic.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} →{' '}
                                                {new Date(epic.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <FiTrendingUp className="mx-auto text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">Sprints</p>
                                            <p className="font-semibold text-sm">
                                                {epic.completedSprints} / {epic.sprintCount}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg" />
                                            <p className="text-xs text-gray-500 mt-2">Epic Lead</p>
                                            <p className="font-semibold text-sm">You</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}