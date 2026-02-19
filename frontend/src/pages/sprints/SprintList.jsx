import { Link } from 'react-router-dom';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';

export default function SprintList({ sprints = [], onDelete, limit }) {
    const displaySprints = limit ? sprints.slice(0, limit) : sprints;

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'planned':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (displaySprints.length === 0) {
        return (
            <div className="text-center py-8">
                <FiCalendar className="mx-auto text-3xl text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No sprints available</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {displaySprints.map((sprint) => (
                <Link
                    key={sprint.id}
                    to={`/sprints/${sprint.id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-medium text-gray-900">{sprint.name}</h3>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(sprint.status)}`}>
                                    {sprint.status?.toUpperCase() || 'PLANNED'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1 mb-2">{sprint.goal}</p>
                            <div className="flex items-center gap-4 text-[10px] text-gray-500">
                                <span>
                                    {new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}
                                </span>
                                {sprint.velocity > 0 && (
                                    <span>Velocity: {sprint.velocity} pts</span>
                                )}
                            </div>
                        </div>
                        <FiChevronRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" size={18} />
                    </div>
                    {sprint.progress > 0 && (
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{sprint.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
                                    style={{ width: `${sprint.progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </Link>
            ))}
        </div>
    );
}