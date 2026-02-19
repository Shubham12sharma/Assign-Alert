import PageWrapper from '../../components/layout/PageWrapper';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Helper to match IDs across possible fields
function matchId(c, id) {
    if (!c || !id) return false;
    return [c.id, c.mongo_id, c._id, String(c.id)].includes(id) || String(c.id) === String(id) || String(c.mongo_id) === String(id);
}

export default function ManageCommunities() {
    const { communities = [], currentCommunity } = useSelector(state => state.community || {});

    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Manage Communities</h1>
                <p className="text-sm text-gray-600 mt-2">View and manage your sub-communities.</p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Sub-communities</h2>
                    <Link to="/admin/communities/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create Sub Community</Link>
                </div>

                <ul className="space-y-3">
                    {(() => {
                        // Find the parent community object that matches currentCommunity
                        const parent = (communities || []).find(c => matchId(c, currentCommunity));
                        const subs = parent?.subCommunities || [];

                        if (!parent) {
                            return <li className="text-sm text-gray-500">Select a community first to manage its sub-communities.</li>;
                        }

                        if (subs.length === 0) {
                            return <li className="text-sm text-gray-500">No sub-communities found under {parent.name}.</li>;
                        }

                        return subs.map(s => (
                            <li key={s.id} className="p-4 border rounded-lg flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{s.name}</div>
                                    <div className="text-sm text-gray-500">{s.member_count} members</div>
                                </div>
                                <div>
                                    <Link to={`/community/${s.id}`} className="text-indigo-600">Open</Link>
                                </div>
                            </li>
                        ));
                    })()}
                </ul>
            </div>
        </PageWrapper>
    );
}
