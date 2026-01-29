import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import TaskModal from '../../components/common/TaskModal';
import { fetchPersonalTasks } from '../../store/taskSlice';
import { FiPlus, FiCalendar, FiCheckCircle, FiClock, FiTarget } from 'react-icons/fi';

export default function PersonalDashboard() {
    const dispatch = useDispatch();
    const { tasks = [], loading } = useSelector(state => state.task);
    const { user } = useSelector(state => state.auth);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchPersonalTasks()); // This should filter by current user + isPersonal
    }, [dispatch]);

    // Only show tasks that belong to the current user and are personal
    const personalTasks = tasks.filter(
        task => task.isPersonal && task.assignee === user?.id
    );

    const todoTasks = personalTasks.filter(t => t.status === 'todo');
    const inProgressTasks = personalTasks.filter(t => t.status === 'inProgress');
    const doneTasks = personalTasks.filter(t => t.status === 'done');

    const today = new Date();
    const overdueTasks = personalTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < today && t.status !== 'done';
    });

    const completionRate = personalTasks.length > 0
        ? Math.round((doneTasks.length / personalTasks.length) * 100)
        : 0;

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-xl text-gray-600">Loading your personal space...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Personal Space
                                </h1>
                                <p className="text-xl text-gray-600 mt-3">
                                    Welcome back, {user?.name || 'you'}! This is your private space.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="group flex items-center gap-4 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105"
                            >
                                <FiPlus className="text-2xl group-hover:rotate-90 transition" />
                                New Personal Task
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {/* Total Tasks */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-purple-100 hover:shadow-2xl transition">
                            <div className="flex items-center justify-between mb-6">
                                <FiTarget className="text-4xl text-purple-600" />
                                <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                    +{Math.floor(Math.random() * 20)} this week
                                </span>
                            </div>
                            <p className="text-gray-600 mb-2">Total Tasks</p>
                            <p className="text-6xl font-extrabold text-gray-900">{personalTasks.length}</p>
                        </div>

                        {/* In Progress */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition">
                            <div className="flex items-center justify-between mb-6">
                                <FiClock className="text-4xl text-blue-600" />
                                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <p className="text-gray-600 mb-2">In Progress</p>
                            <p className="text-6xl font-extrabold text-gray-900">{inProgressTasks.length}</p>
                        </div>

                        {/* Completed */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-green-100 hover:shadow-2xl transition">
                            <div className="flex items-center justify-between mb-6">
                                <FiCheckCircle className="text-4xl text-green-600" />
                                <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                    {completionRate}%
                                </span>
                            </div>
                            <p className="text-gray-600 mb-2">Completed</p>
                            <p className="text-6xl font-extrabold text-gray-900">{doneTasks.length}</p>
                        </div>

                        {/* Overdue */}
                        <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border ${overdueTasks.length > 0 ? 'border-red-200' : 'border-gray-100'} hover:shadow-2xl transition`}>
                            <div className="flex items-center justify-between mb-6">
                                <FiCalendar className={`text-4xl ${overdueTasks.length > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${overdueTasks.length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {overdueTasks.length === 0 ? 'All clear!' : 'Needs attention'}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-2">Overdue</p>
                            <p className="text-6xl font-extrabold text-gray-900">{overdueTasks.length}</p>
                        </div>
                    </div>

                    {/* Task List */}
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-8">My Personal Tasks</h2>

                        {personalTasks.length === 0 ? (
                            <div className="text-center py-32 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-indigo-300">
                                <div className="text-8xl mb-8">✨</div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Your personal space is empty</h3>
                                <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
                                    Add your first personal task to stay organized and focused on your life goals.
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center gap-4 px-10 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105"
                                >
                                    <FiPlus className="text-3xl" />
                                    Create First Personal Task
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {personalTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-indigo-300 transition overflow-hidden"
                                    >
                                        <div className={`h-2 bg-gradient-to-r ${task.status === 'done' ? 'from-green-500 to-emerald-500' :
                                                task.status === 'inProgress' ? 'from-blue-500 to-cyan-500' :
                                                    'from-purple-500 to-pink-500'
                                            }`}></div>

                                        <div className="p-8">
                                            <h3 className={`text-2xl font-bold mb-3 ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                {task.title}
                                            </h3>

                                            <p className="text-gray-600 mb-6 leading-relaxed">{task.description}</p>

                                            {task.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-3 mb-6">
                                                    {task.tags.map(tag => (
                                                        <span key={tag} className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                                <span className={`px-4 py-2 rounded-xl font-bold text-sm ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                        task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                                                </span>

                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${task.status === 'done' ? 'text-green-600' : 'text-gray-700'}`}>
                                                        {task.status === 'todo' ? 'To Do' : task.status === 'inProgress' ? 'Doing' : 'Done'}
                                                    </p>
                                                    {task.dueDate && (
                                                        <p className={`text-sm mt-2 ${new Date(task.dueDate) < today && task.status !== 'done' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                                            Due {new Date(task.dueDate).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Modal */}
                <TaskModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    mode="create"
                    initialData={{ isPersonal: true }}
                />
                </div>
        </PageWrapper>
    );
}