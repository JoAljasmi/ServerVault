import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import AiChat from "../components/AiChat";

function ServerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [server, setServer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchServer();
        const interval = setInterval(fetchServer, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchServer = async () => {
        try {
            const res = await API.get(`/servers/${id}`);
            setServer(res.data);
        } catch (err) {
            setError("Server not found");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        setActionLoading(action);
        try {
            await API.post(`/servers/${id}/action`, { action });
            fetchServer();
        } catch (err) {
            setError("Action failed");
        } finally {
            setActionLoading("");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this server? This cannot be undone.")) return;
        try {
            await API.delete(`/servers/${id}`);
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to delete server");
        }
    };

    const copyIp = () => {
        const textArea = document.createElement("textarea");
        textArea.value = server.ip_address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error && !server) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <p className="text-red-400 text-lg">{error}</p>
                    <button onClick={() => navigate("/dashboard")} className="mt-4 text-blue-400 hover:text-blue-300">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const statusColor = {
        running: "text-green-400 bg-green-400/10 border-green-400/30",
        stopped: "text-red-400 bg-red-400/10 border-red-400/30",
        starting: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
        restarting: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition"
                >
                    ← Back to Dashboard
                </button>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Server Header */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={server.game === "minecraft" ? "/minecraft.jpg" : "/cs2.jpg"}
                                alt={server.game}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-white">{server.name}</h1>
                                <p className="text-gray-400 text-sm mt-1">{server.game.toUpperCase()} Server</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor[server.status] || "text-gray-400"}`}>
                            ● {server.status}
                        </span>
                    </div>

                    {/* IP Address */}
                    <div className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Server Address</p>
                            <p className="text-white font-mono text-lg">{server.ip_address}</p>
                        </div>
                        <button
                            onClick={copyIp}
                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-sm transition"
                        >
                            {copied ? (
                        <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                            Copied!
                            </>
                            ) : (
                                <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                                Copy IP
                            </>
                                )}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
                        <p className="text-gray-400 text-xs mb-2">CPU Usage</p>
                        <p className="text-2xl font-bold text-white">{server.cpu_usage}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div
                                className={`h-2 rounded-full ${server.cpu_usage > 80 ? 'bg-red-500' : server.cpu_usage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(server.cpu_usage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
                        <p className="text-gray-400 text-xs mb-2">RAM Usage</p>
                        <p className="text-2xl font-bold text-white">{server.ram_usage}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div
                                className={`h-2 rounded-full ${server.ram_usage > 80 ? 'bg-red-500' : server.ram_usage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(server.ram_usage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
                        <p className="text-gray-400 text-xs mb-2">Players Online</p>
                        <p className="text-2xl font-bold text-blue-400">{server.player_count}</p>
                        <p className="text-gray-500 text-xs mt-2">of {server.max_players} slots</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
                        <p className="text-gray-400 text-xs mb-2">Monthly Cost</p>
                        <p className="text-2xl font-bold text-yellow-400">${server.monthly_cost}</p>
                        <p className="text-gray-500 text-xs mt-2">per month</p>
                    </div>
                </div>

                {/* Server Info */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Server Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Game</span>
                            <span className="text-white">{server.game.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Status</span>
                            <span className={`${server.status === 'running' ? 'text-green-400' : 'text-red-400'}`}>{server.status}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">IP Address</span>
                            <span className="text-white font-mono">{server.ip_address}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Max Players</span>
                            <span className="text-white">{server.max_players}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Created</span>
                            <span className="text-white">{new Date(server.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Server ID</span>
                            <span className="text-white">#{server.id}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Server Controls</h2>
                    <div className="flex flex-wrap gap-3">
                        {server.status === "stopped" ? (
                            <button
                                onClick={() => handleAction("start")}
                                disabled={actionLoading === "start"}
                                className="bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white px-6 py-3 rounded-lg font-medium transition"
                            >
                                {actionLoading === "start" ? "Starting..." : "▶ Start Server"}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleAction("stop")}
                                disabled={actionLoading === "stop"}
                                className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-600/50 text-white px-6 py-3 rounded-lg font-medium transition"
                            >
                                {actionLoading === "stop" ? "Stopping..." : "⏹ Stop Server"}
                            </button>
                        )}
                        <button
                            onClick={() => handleAction("restart")}
                            disabled={actionLoading === "restart"}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            {actionLoading === "restart" ? "Restarting..." : "🔄 Restart Server"}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-3 rounded-lg font-medium transition ml-auto"
                        >
                            🗑️ Delete Server
                        </button>
                    </div>
                </div>
            </div>

            <AiChat />
        </div>
    );
}

export default ServerDetail;