export default function CommunityList() {
    const communities = ["Main Org", "Mumbai Branch", "Backend Team"];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Communities</h1>

            <div className="grid grid-cols-3 gap-4">
                {communities.map((c, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow">
                        <h3 className="font-semibold">{c}</h3>
                        <p className="text-gray-500 text-sm">12 members</p>
                    </div>
                ))}

                {user.role === 'Member' && !user.communities.includes(community.id) && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                        Request to Join
                    </button>
                )}
            </div>
        </div>
    );
}
