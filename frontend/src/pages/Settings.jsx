import PageWrapper from '../components/layout/PageWrapper';
import { useSelector } from 'react-redux';

export default function Settings() {
    const { user } = useSelector((state) => state.auth || {});

    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-sm text-gray-600 mt-2">Manage your account and preferences.</p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Account</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Email</div>
                            <div className="text-sm text-gray-500">{user?.email || '—'}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Role</div>
                            <div className="text-sm text-gray-500">{user?.role || '—'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
