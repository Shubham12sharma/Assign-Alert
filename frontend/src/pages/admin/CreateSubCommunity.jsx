import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../api/api';
import PageWrapper from '../../components/layout/PageWrapper';
import { useNavigate } from 'react-router-dom';
import { fetchCommunities } from '../../store/communitySlice';

export default function CreateSubCommunity() {
    const { currentCommunity } = useSelector(state => state.community || {});
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const handleCreate = async () => {
        if (!name) return setError('Name is required');
        setLoading(true);
        setError('');
        try {
            const payload = { name, parent: currentCommunity };
            const res = await api.post('/communities/', payload);
            // refresh communities and redirect to manage communities
            try { await dispatch(fetchCommunities()).unwrap(); } catch (e) { /* ignore */ }
            navigate('/admin/communities');
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Create Sub Community</h1>
                <p className="text-sm text-gray-600 mt-2">Create a sub-community under your current community.</p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 max-w-xl">
                <label className="block mb-2 font-medium">Sub Community Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg mb-4" />
                {error && <div className="text-red-600 mb-3">{error}</div>}
                <div className="flex gap-3">
                    <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{loading ? 'Creating...' : 'Create'}</button>
                </div>
            </div>
        </PageWrapper>
    );
}
