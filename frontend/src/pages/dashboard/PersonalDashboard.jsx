import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import TaskModal from '../../components/common/TaskModal';
import { fetchPersonalTasks } from '../../store/taskSlice';
import { FiPlus, FiCalendar, FiCheckCircle, FiClock, FiTarget, FiUser } from 'react-icons/fi';

export default function PersonalDashboard() {
    const dispatch = useDispatch();
    const { tasks = [], loading } = useSelector(state => state.task);
    const { user } = useSelector(state => state.auth);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchPersonalTasks());
    }, [dispatch]);

    // Only show tasks that belong to the current user and are personal
    const personalTasks = tasks.filter(
        task => task.isPersonal && task.assignee === user?.id
    );

    const todoTasks = personalTasks.filter(t => t.status === 'todo' || t.status === 'To Do');
    const inProgressTasks = personalTasks.filter(t => t.status === 'inProgress' || t.status === 'In Progress');
    const doneTasks = personalTasks.filter(t => t.status === 'done' || t.status === 'Done');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = personalTasks.filter(t => {
        if (!t.due_date && !t.dueDate) return false;
        const dueDate = new Date(t.due_date || t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today && t.status !== 'done' && t.status !== 'Done';
    });

    const completionRate = personalTasks.length > 0
        ? Math.round((doneTasks.length / personalTasks.length) * 100)
        : 0;

    const getWeekGrowth = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const tasksThisWeek = personalTasks.filter(t => {
            const createdDate = new Date(t.created_at || t.createdAt || Date.now());
            return createdDate >= oneWeekAgo;
        }).length;

        return tasksThisWeek;
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Loading your personal space...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Header */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Personal Space
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Welcome back, <span className="font-semibold text-indigo-600">{user?.name || 'you'}</span>! This is your private space.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium text-sm shadow-sm transition-all"
                            >
                                <FiPlus size={16} />
                                New Personal Task
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Total Tasks */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FiTarget className="text-purple-600" size={20} />
                                </div>
                                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                    +{getWeekGrowth()} this week
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Total Tasks</p>
                            <p className="text-3xl font-bold text-gray-900">{personalTasks.length}</p>
                        </div>

                        {/* In Progress */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FiClock className="text-blue-600" size={20} />
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">In Progress</p>
                            <p className="text-3xl font-bold text-gray-900">{inProgressTasks.length}</p>
                        </div>

                        {/* Completed */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FiCheckCircle className="text-green-600" size={20} />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    {completionRate}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-gray-900">{doneTasks.length}</p>
                        </div>

                        {/* Overdue */}
                        <div className={`bg-white rounded-lg shadow-sm p-5 border ${overdueTasks.length > 0 ? 'border-red-200' : 'border-gray-200'} hover:shadow-md transition`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${overdueTasks.length > 0 ? 'bg-red-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                                    <FiCalendar className={overdueTasks.length > 0 ? 'text-red-600' : 'text-gray-600'} size={20} />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${overdueTasks.length > 0
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {overdueTasks.length === 0 ? 'All clear!' : 'Overdue'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Overdue</p>
                            <p className="text-3xl font-bold text-gray-900">{overdueTasks.length}</p>
                        </div>
                    </div>

                    {/* Task List */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Personal Tasks</h2>

                        {personalTasks.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-indigo-200">
                                <div className="text-5xl mb-4">✨</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your personal space is empty</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                    Add your first personal task to stay organized and focused on your life goals.
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm transition"
                                >
                                    <FiPlus size={16} />
                                    Create First Personal Task
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {personalTasks.map((task) => {
                                    const dueDate = task.due_date || task.dueDate;
                                    const isOverdue = dueDate && new Date(dueDate) < today && task.status !== 'done' && task.status !== 'Done';

                                    return (
                                        <div
                                            key={task.id}
                                            className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition overflow-hidden"
                                        >
                                            <div className={`h-1.5 ${task.status === 'done' || task.status === 'Done' ? 'bg-green-500' :
                                                    task.status === 'inProgress' || task.status === 'In Progress' ? 'bg-blue-500' :
                                                        'bg-purple-500'
                                                }`}></div>

                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className={`font-medium ${task.status === 'done' || task.status === 'Done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                        {task.title}
                                                    </h3>
                                                    {task.assignee && (
                                                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-medium">
                                                            {user?.name?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                                                {task.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {task.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {task.tags.length > 3 && (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                                                +{task.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded ${task.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                                                            task.priority?.toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {task.priority || 'Medium'}
                                                    </span>

                                                    <div className="text-right">
                                                        <span className={`text-xs font-medium ${task.status === 'done' || task.status === 'Done' ? 'text-green-600' :
                                                                task.status === 'inProgress' || task.status === 'In Progress' ? 'text-blue-600' :
                                                                    'text-gray-600'
                                                            }`}>
                                                            {task.status === 'todo' || task.status === 'To Do' ? 'To Do' :
                                                                task.status === 'inProgress' || task.status === 'In Progress' ? 'Doing' :
                                                                    'Done'}
                                                        </span>
                                                        {dueDate && (
                                                            <p className={`text-[10px] mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                                Due {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Modal */}
                <TaskModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    mode="create"
                />
            </div>
        </PageWrapper>
    );
}