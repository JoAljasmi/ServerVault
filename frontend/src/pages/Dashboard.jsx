import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import ServerCard from "../components/ServerCard";
import AiChat from "../components/AiChat";

function Dashboard() {
    const [servers, setServers] = useState([]);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newServer, setNewServer] = useState({ name: "", game: "minecraft", max_players: 20 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        fetchUser();

        const interval = setInterval(() => {
            fetchData();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchUser = async () => {
        try {
            const res = await API.get("/auth/me");
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const fetchData = async () => {
        try {
            const [serversRes, statsRes] = await Promise.all([
                API.get("/servers"),
                API.get("/dashboard/stats"),
            ]);
            setServers(serversRes.data);
            setStats(statsRes.data);
        } catch (err) {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post("/servers", newServer);
            setShowCreate(false);
            setNewServer({ name: "", game: "minecraft", max_players: 20 });
            fetchData();
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (typeof detail === "string") {
                setError(detail);
            } else {
                setError("Failed to create server");
            }
        }
    };

    const handleAction = async (serverId, action) => {
        try {
            await API.post(`/servers/${serverId}/action`, { action });
            fetchData();
        } catch (err) {
            setError("Action failed");
        }
    };

    const handleDelete = async (serverId) => {
        if (!window.confirm("Are you sure you want to delete this server?")) return;
        try {
            await API.delete(`/servers/${serverId}`);
            fetchData();
        } catch (err) {
            setError("Failed to delete server");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your servers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Message */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back{user ? `, ${user.username}` : ""} 👋
                    </h1>
                    <p className="text-gray-400 mt-1">Here's an overview of your Minecraft servers</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">✕</button>
                    </div>
                )}

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Total Servers</p>
                                <span className="text-2xl">🖥️</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.total_servers}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Active Servers</p>
                                <span className="text-2xl">✅</span>
                            </div>
                            <p className="text-3xl font-bold text-green-400">{stats.active_servers}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Total Players</p>
                                <span className="text-2xl">👥</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-400">{stats.total_players}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Monthly Cost</p>
                                <span className="text-2xl">💰</span>
                            </div>
                            <p className="text-3xl font-bold text-yellow-400">${stats.monthly_cost}</p>
                        </div>
                    </div>
                )}

                {/* Header + Create Button */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Your Servers</h2>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            showCreate
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                    >
                        {showCreate ? "✕ Cancel" : "+ New Server"}
                    </button>
                </div>

                {/* Create Server Form */}
                {showCreate && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-medium text-white mb-4">⛏️ Deploy a New Minecraft Server</h3>
                        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-48">
                                <label className="text-gray-300 text-sm block mb-2">Server Name</label>
                                <input
                                    type="text"
                                    value={newServer.name}
                                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                    placeholder="My Awesome Server"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm block mb-2">Max Players</label>
                                <input
                                    type="number"
                                    value={newServer.max_players}
                                    onChange={(e) => setNewServer({ ...newServer, max_players: parseInt(e.target.value) })}
                                    className="w-24 p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                    min="2"
                                    max="100"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition"
                            >
                                🚀 Deploy Server
                            </button>
                        </form>
                        <p className="text-gray-500 text-xs mt-3">Server will be ready in about 30-60 seconds. Cost: $9.99/mo</p>
                    </div>
                )}

                {/* Server List */}
                {servers.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-16 text-center">
                        <div className="text-6xl mb-4">⛏️</div>
                        <p className="text-gray-300 text-lg font-medium mb-2">No servers yet</p>
                        <p className="text-gray-500 text-sm mb-6">Deploy your first Minecraft server and start playing with friends</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            + Create Your First Server
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {servers.map((server) => (
                            <ServerCard
                                key={server.id}
                                server={server}
                                onAction={handleAction}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AiChat />
        </div>
    );
}

export default Dashboard;