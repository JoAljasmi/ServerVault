import { useNavigate } from "react-router-dom";

function ServerCard({ server, onAction, onDelete }) {
    const navigate = useNavigate();

    const statusColors = {
        running: "text-green-400 bg-green-400/10",
        stopped: "text-red-400 bg-red-400/10",
        starting: "text-yellow-400 bg-yellow-400/10",
        restarting: "text-yellow-400 bg-yellow-400/10",
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition">
            {/* Header */}
            <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => navigate(`/server/${server.id}`)}
            >
                <div className="flex items-center gap-3">
                    <img
                        src={server.game === "minecraft" ? "/minecraft.jpg" : "/cs2.jpg"}
                        alt={server.game}
                        className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                        <h3 className="text-white font-semibold">{server.name}</h3>
                        <p className="text-gray-500 text-xs font-mono">{server.ip_address}</p>
                    </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[server.status] || "text-gray-400 bg-gray-400/10"}`}>
                    {server.status}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-700/30 rounded-lg p-2.5 text-center">
                    <p className="text-gray-500 text-xs mb-1">CPU</p>
                    <p className="text-white font-semibold text-sm">{server.cpu_usage}%</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-2.5 text-center">
                    <p className="text-gray-500 text-xs mb-1">RAM</p>
                    <p className="text-white font-semibold text-sm">{server.ram_usage}%</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-2.5 text-center">
                    <p className="text-gray-500 text-xs mb-1">Players</p>
                    <p className="text-white font-semibold text-sm">{server.player_count}/{server.max_players}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {server.status === "stopped" ? (
                    <button
                        onClick={() => onAction(server.id, "start")}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600/10 text-green-400 hover:bg-green-600/20 py-2 rounded-lg text-sm font-medium transition"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Start
                    </button>
                ) : (
                    <button
                        onClick={() => onAction(server.id, "stop")}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600/20 py-2 rounded-lg text-sm font-medium transition"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z" />
                        </svg>
                        Stop
                    </button>
                )}
                <button
                    onClick={() => onAction(server.id, "restart")}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 py-2 rounded-lg text-sm font-medium transition"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restart
                </button>
                <button
                    onClick={() => onDelete(server.id)}
                    className="bg-red-600/10 text-red-400 hover:bg-red-600/20 px-3 py-2 rounded-lg text-sm transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
                <span className="text-gray-500 text-xs">{server.game.toUpperCase()}</span>
                <span className="text-gray-400 text-sm font-medium">${server.monthly_cost}/mo</span>
            </div>
        </div>
    );
}

export default ServerCard;