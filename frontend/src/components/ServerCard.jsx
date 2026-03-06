function ServerCard({ server, onAction, onDelete }) {
    const gameIcons = {
        cs2: "/cs2.jpg", 
        rust: "/rust.jpg",
        minecraft: "/minecraft.jpg",
    };

    const statusColors = {
        running: "text-green-400",
        stopped: "text-red-400",
        starting: "text-yellow-400",
        restarting: "text-yellow-400",
    };

    return (
        <div className='bg-gray-800 border border-gray-700 rounded-xl p-5'>
            {/*Header*/}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <img src={gameIcons[server.game]} alt={server.game} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                <h3 className="text-white font-semibold">{server.name}</h3>
                <p className="text-gray-500 text-xs">{server.fake_ip}</p>
                </div>
            </div>
            <span className={`text-sm font-medium ${statusColors[server.status] || "text-gray-400"}`}>
                {server.status}
            </span>
        </div>

        {/*stats*/}
        <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
        <p className="text-gray-400 text-xs">CPU</p>
        <p className="text-white font-semibold text-sm">{server.fake_cpu}%</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
        <p className="text-gray-400 text-xs">RAM</p>
        <p className="text-white font-semibold text-sm">{server.fake_ram}%</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
        <p className="text-gray-400 text-xs">Players</p>
        <p className="text-white font-semibold text-sm">{server.fake_players}/{server.max_players}</p>
        </div>
    </div>

     {/* Actions */}
    <div className="flex gap-2">
        {server.status === "stopped" ? (
        <button
            onClick={() => onAction(server.id, "start")}
            className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 py-2 rounded-lg text-sm font-medium transition"
        >
            Start
        </button>
        ) : (
        <button
            onClick={() => onAction(server.id, "stop")}
            className="flex-1 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 py-2 rounded-lg text-sm font-medium transition"
        >
            Stop
        </button>
        )}
        <button
        onClick={() => onAction(server.id, "restart")}
        className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 py-2 rounded-lg text-sm font-medium transition"
        >
        Restart
        </button>
        <button
        onClick={() => onDelete(server.id)}
        className="bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-2 rounded-lg text-sm transition"
        >
        Delete
        </button>
    </div>

      {/* Cost */}
    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
        <span className="text-gray-400 text-xs">{server.game.toUpperCase()}</span>
        <span className="text-gray-300 text-sm font-medium">${server.monthly_cost}/mo</span>
    </div>
    </div>
);
}

export default ServerCard;