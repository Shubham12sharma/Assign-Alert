import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // ← add useSelector if needed
import { generateInvite } from '../../store/inviteSlice';
import { FiCopy, FiCheck, FiMail, FiLink, FiX } from 'react-icons/fi';

export default function InviteModal({ isOpen, onClose, communityId }) {
    const dispatch = useDispatch();

    // Optional: fallback to Redux currentCommunity if prop is missing
    const reduxCurrentCommunity = useSelector(state => state.community.currentCommunity);

    // Use prop first, fallback to redux if needed
    const activeCommunityId = communityId || reduxCurrentCommunity;

    const [role, setRole] = useState('Member');
    const [email, setEmail] = useState('');
    const [generated, setGenerated] = useState(null);
    const [copied, setCopied] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');

    const handleGenerate = async () => {
        if (!activeCommunityId) {
            setMessage('Cannot generate invite: Community ID is missing');
            return;
        }

        try {
            const resultAction = await dispatch(
                generateInvite({ communityId: activeCommunityId, role })
            );

            if (generateInvite.fulfilled.match(resultAction)) {
                setGenerated(resultAction.payload);
                setMessage('');
            } else if (generateInvite.rejected.match(resultAction)) {
                setMessage(resultAction.payload || 'Failed to generate invite');
            }
        } catch (err) {
            setMessage('Unexpected error while generating invite');
        }
    };

    const handleSendEmail = async () => {
        if (!email || !generated || !activeCommunityId) return;

        setSending(true);
        setMessage('');

        try {
            const backendBase = import.meta.env.DEV ? 'http://127.0.0.1:8000' : '';
            const res = await fetch(`${backendBase}/api/communities/${activeCommunityId}/generate-invite/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ role, email })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Failed to send email');
            }

            const data = await res.json();
            setMessage(data.message || 'Email sent successfully!');
        } catch (err) {
            setMessage(err.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const copyLink = () => {
        if (!generated) return;

        const link = generated.invite_link || `${window.location.origin}/signup?invite=${generated.code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-3xl font-bold mb-6">Invite Team Member</h2>

                {!generated ? (
                    <>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 transition"
                            >
                                <option value="Member">Member</option>
                                <option value="Admin">Admin</option>
                                <option value="Guest">Guest (Read-only)</option>
                            </select>
                        </div>

                        {message && (
                            <p className="text-red-600 text-sm mb-4">{message}</p>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={!activeCommunityId}
                                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate Invite
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCheck className="text-4xl text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Invite Ready!</h3>
                        <p className="text-gray-600 mb-6">
                            Share this link or send email. They will join as <strong>{generated.role || role}</strong>.
                        </p>

                        <div className="bg-gray-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <code className="font-mono text-sm break-all">
                                {generated.invite_link || `${window.location.origin}/signup?invite=${generated.code}`}
                            </code>
                            <button
                                onClick={copyLink}
                                className="ml-4 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                {copied ? <FiCheck /> : <FiCopy />}
                            </button>
                        </div>

                        {/* Email Sending Section */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Send Invite by Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="team@company.com"
                                className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-200 transition"
                            />
                        </div>

                        {message && (
                            <p className={`text-sm mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleSendEmail}
                                disabled={sending || !email}
                                className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition disabled:opacity-50"
                            >
                                <FiMail /> {sending ? 'Sending...' : 'Send Email'}
                            </button>
                            <button
                                onClick={() => {
                                    setGenerated(null);
                                    setEmail('');
                                    setMessage('');
                                }}
                                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl transition"
                            >
                                New Invite
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}