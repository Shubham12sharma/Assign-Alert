import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';

export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);

    if (user.role === 'Super Admin' || user.role === 'Admin') {
        return <Navigate to="/admin/dashboard" />;
    }
    return <MemberDashboard />;
}

function MemberDashboard() {
    return (
        <PageWrapper>
            <h1 className="text-2xl font-bold mb-6">Personal Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Assigned Tasks</h3>
                    <p className="text-3xl font-bold text-indigo-600">12</p>
                    <p className="text-sm text-gray-500">3 overdue</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Active Sprints</h3>
                    <p className="text-3xl font-bold text-indigo-600">2</p>
                    <p className="text-sm text-gray-500">Weekly Sprint Progress: 65%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">AI Insights</h3>
                    <p className="text-sm">Workload Balanced | No Deadline Risks</p>
                    <button className="mt-2 text-indigo-600 hover:underline">Generate Report</button>
                </div>
            </div>
            {/* Add charts or task lists here */}
        </PageWrapper>
    );
}

// Similar for AdminDashboard.jsx, with more org-wide metrics