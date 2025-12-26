export default function SprintList() {
    const sprints = [
        { name: "January Sprint", status: "Active" },
        { name: "Week 1 Sprint", status: "Completed" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Sprints</h1>

            {sprints.map((s, i) => (
                <div
                    key={i}
                    className="bg-white p-4 rounded-xl shadow mb-3"
                >
                    <h3 className="font-semibold">{s.name}</h3>
                    <span className="text-sm text-gray-500">{s.status}</span>
                </div>
            ))}
        </div>
    );
}

