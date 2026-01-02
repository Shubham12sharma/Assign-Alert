import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { generateInvite } from '../../store/inviteSlice';
import { FiCopy, FiCheck, FiMail, FiLink } from 'react-icons/fi';

export default function InviteModal({ isOpen, onClose, communityId }) {
    const dispatch = useDispatch();
    const [role, setRole] = useState('Member');
    const [generated, setGenerated] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        const result = await dispatch(generateInvite({ communityId, role }));
        if (generateInvite.fulfilled.match(result)) {
            setGenerated(result.payload);
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/signup?invite=${generated.code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
                <h2 className="text-3xl font-bold mb-6">Invite Team Member</h2>

                {!generated ? (
                    <>
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Assign Role</label>
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

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                            >
                                Generate Invite Link
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCheck className="text-4xl text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Invite Link Ready!</h3>
                        <p className="text-gray-600 mb-6">
                            Share this link with your team member. They will join as <strong>{generated.role}</strong>.
                        </p>

                        <div className="bg-gray-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <code className="font-mono text-sm">
                                {window.location.origin}/signup?invite={generated.code}
                            </code>
                            <button
                                onClick={copyLink}
                                className="ml-4 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                {copied ? <FiCheck /> : <FiCopy />}
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 flex items-center justify-center gap-3 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition">
                                <FiMail /> Send via Email
                            </button>
                            <button
                                onClick={() => {
                                    setGenerated(null);
                                    onClose();
                                }}
                                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}