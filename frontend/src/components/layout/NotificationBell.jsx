import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead } from '../../store/notificationSlice';
import { FiBell, FiX } from 'react-icons/fi';

export default function NotificationBell() {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector(state => state.notification);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 hover:bg-gray-100 rounded-xl transition"
            >
                <FiBell className="text-2xl text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => dispatch(markAllAsRead())}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No notifications yet</p>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition ${!notif.read ? 'bg-indigo-50' : ''}`}
                                >
                                    <p className="text-sm text-gray-800">
                                        <span className="font-medium text-indigo-600">@{notif.mentionedUser}</span>
                                        {' '}{notif.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.timestamp).toLocaleString()}
                                    </p>
                                    {!notif.read && (
                                        <button
                                            onClick={() => dispatch(markAsRead(notif.id))}
                                            className="text-xs text-indigo-600 hover:underline mt-2"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}