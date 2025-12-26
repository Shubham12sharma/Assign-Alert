import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageWrapper from '../../components/layout/PageWrapper';
import { fetchPersonalTasks } from '../../store/taskSlice';

export default function PersonalDashboard() {
    const dispatch = useDispatch();
    const { tasks, loading } = useSelector(state => state.task);

    useEffect(() => {
        dispatch(fetchPersonalTasks());
    }, [dispatch]);

    return (
        <PageWrapper>
            <h1 className="text-2xl font-bold mb-6">Personal Dashboard</h1>

            {loading && <p className="text-gray-500">Loading personal tasks...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks?.length === 0 && !loading && (
                    <p className="text-gray-500">No personal tasks yet.</p>
                )}

                {tasks?.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="mt-2 text-xs text-gray-500">Due: {task.dueDate}</div>
                        <div className="mt-1 text-xs text-gray-500">Status: {task.status}</div>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
}
