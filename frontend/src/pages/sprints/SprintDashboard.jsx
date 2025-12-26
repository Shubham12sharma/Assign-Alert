import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { fetchSprints } from '../../store/sprintSlice';
import { FiCalendar, FiTarget, FiTrendingUp, FiClock } from 'react-icons/fi';

export default function SprintDashboard() {
    const dispatch = useDispatch();
    const { sprints, currentSprint, loading } = useSelector((state) => state.sprint);
    const { currentCommunity } = useSelector((state) => state.community);

    useEffect(() => {
        if (currentCommunity?.id) {
            dispatch(fetchSprints({ communityId: currentCommunity.id }));
        }
    }, [dispatch, currentCommunity]);

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500">Loading sprints...</p>
                </div>
            </PageWrapper>
        );
    }

    const activeSprint = currentSprint || sprints.find(s => s.status === 'active') || sprints[0];

    return (
        <PageWrapper>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sprint Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Track progress, velocity, and goals for {currentCommunity?.name || 'your team'}
                </p>
            </div>

            {activeSprint && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Current Sprint Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-indigo-700">{activeSprint.name}</h2>
                                <p className="text-gray-600 mt-1">{activeSprint.goal}</p>
                            </div>
                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                                Active
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div>
                                <p className="text-sm text-gray-500">Sprint Period</p>
                                <p className="font-semibold">
                                    {new Date(activeSprint.startDate).toLocaleDateString()} –{' '}
                                    {new Date(activeSprint.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Velocity</p>
                                <p className="text-2xl font-bold text-indigo-600">{activeSprint.velocity} pts</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Progress</p>
                                <p className="text-2xl font-bold text-indigo-600">{activeSprint.progress}%</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Story Points Completed</span>
                                <span>{activeSprint.completedPoints} / {activeSprint.totalPoints}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${activeSprint.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <FiTrendingUp className="text-3xl text-indigo-600 mb-3" />
                            <p className="text-sm text-gray-500">Avg Velocity</p>
                            <p className="text-2xl font-bold">56 pts</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <FiClock className="text-3xl text-green-600 mb-3" />
                            <p className="text-sm text-gray-500">On Track</p>
                            <p className="text-2xl font-bold text-green-700">Yes</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Sprints Breakdown */}
            {activeSprint?.weeklySprints && activeSprint.weeklySprints.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Weekly Sprint Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeSprint.weeklySprints.map((week) => (
                            <div key={week.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
                                <p className="font-medium">{week.name}</p>
                                <div className="mt-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Progress</span>
                                        <span>{week.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${week.progress >= 80 ? 'bg-green-500' : week.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${week.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Retrospective */}
            {activeSprint?.retrospective && (
                <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-4">Retrospective Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <p className="text-gray-700 italic">"{activeSprint.retrospective}"</p>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}