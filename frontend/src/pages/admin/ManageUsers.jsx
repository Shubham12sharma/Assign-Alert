import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/api';
import PageWrapper from '../../components/layout/PageWrapper';
import { FiTrash2 } from 'react-icons/fi';

export default function ManageUsers() {
    const { currentCommunity } = useSelector((state) => state.community || {});
    const { user: me } = useSelector((state) => state.auth || {});

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const communities = useSelector((state) => state.community.communities || []);

    useEffect(() => {
        if (!currentCommunity) return;

        // Find community object from store so we can filter members client-side
        const communityObj = communities.find(c => {
            const idCandidates = [c.id, c.mongo_id, c.mongoId, c._id, String(c.id)];
            return idCandidates.includes(currentCommunity) || idCandidates.includes(String(currentCommunity));
        });

        const memberList = communityObj?.members || communityObj?.members_ids || communityObj?.membersIds || [];

        const fetchUsers = async () => {
            setLoading(true);
            setError('');
            try {
                // Use minimal endpoint which returns only members of the community
                const res = await api.get(`/users/minimal/?community=${currentCommunity}`);
                const mapped = (res.data || []).map(u => {
                    const rawRole = u.role || 'Member';
                    return {
                        id: u.id || u.pk || u._id || u.mongo_id || u.user_id,
                        name: u.name || u.username || u.email,
                        email: u.email || '',
                        // Normalize any legacy roles to the new two-role model
                        role: rawRole === 'Super Admin' ? 'Super Admin' : 'Member',
                        raw: u,
                    };
                });

                setUsers(mapped);
            } catch (err) {
                console.error('ManageUsers fetch error', err);
                setError(err.response?.data?.detail || err.message || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentCommunity, communities]);

    const handleRoleChange = async (uId, newRole) => {
        if (!uId) return;
        setUpdatingId(uId);
        try {
            // Send PATCH to update user role
            await api.patch(`/users/${uId}/`, { role: newRole });
            setUsers((prev) => prev.map(u => u.id === uId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Role update failed', err);
            // Optionally show error
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (uId) => {
        if (!uId) return;
        if (!confirm('Delete this user? This action cannot be undone.')) return;

        setUpdatingId(uId);
        try {
            await api.delete(`/users/${uId}/`);
            setUsers((prev) => prev.filter(u => u.id !== uId));
        } catch (err) {
            console.error('Delete user failed', err);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Manage Users</h1>
                <p className="text-sm text-gray-600 mt-2">Manage team members for <strong>{currentCommunity || '—'}</strong></p>
            </div>

            {!currentCommunity ? (
                <div className="bg-white p-6 rounded-xl shadow">Select a community first to manage users.</div>
            ) : (
                <div className="bg-white rounded-2xl shadow p-6">
                    {loading ? (
                        <p>Loading users…</p>
                    ) : error ? (
                        <p className="text-red-600">{error}</p>
                    ) : users.length === 0 ? (
                        <p>No users found in this community.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3">Name</th>
                                        <th className="py-3">Email</th>
                                        <th className="py-3">Role</th>
                                        <th className="py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b hover:bg-gray-50">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                                                        {u.name ? (u.name.split(' ').map(s => s[0]).slice(0,2).join('')) : 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{u.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-600">{u.email}</td>
                                            <td className="py-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    disabled={updatingId === u.id || me?.id === u.id}
                                                    className="px-3 py-2 rounded-lg border"
                                                >
                                                    <option value="Member">Member</option>
                                                    <option value="Super Admin">Super Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        disabled={updatingId === u.id || me?.id === u.id}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 border border-red-100 hover:bg-red-50"
                                                    >
                                                        <FiTrash2 /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </PageWrapper>
    );
}
