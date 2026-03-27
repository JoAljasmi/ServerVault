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
        const interval = setInterval(() => { fetchData(); }, 10000);
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
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back{user ? `, ${user.username}` : ""}
                    </h1>
                    <p className="text-gray-400 mt-1">Here's an overview of your game servers</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Total Servers</p>
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.total_servers}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Active Servers</p>
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-green-400">{stats.active_servers}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Total Players</p>
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-purple-400">{stats.total_players}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-sm">Monthly Cost</p>
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-yellow-400">${stats.monthly_cost}</p>
                        </div>
                    </div>
                )}

                {/* Header + Create */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Your Servers</h2>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                            showCreate
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                    >
                        {showCreate ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Server
                            </>
                        )}
                    </button>
                </div>

                {/* Create Form */}
                {showCreate && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-medium text-white mb-4">Deploy a New Server</h3>
                        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-48">
                                <label className="text-gray-300 text-sm block mb-2">Server Name</label>
                                <input
                                    type="text"
                                    value={newServer.name}
                                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                    placeholder="My Server"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm block mb-2">Game</label>
                                <select
                                    value={newServer.game}
                                    onChange={(e) => setNewServer({ ...newServer, game: e.target.value })}
                                    className="p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="minecraft">Minecraft ($9.99/mo)</option>
                                    <option value="cs2">CS2 ($12.99/mo)</option>
                                </select>
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
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Deploy
                            </button>
                        </form>
                        <p className="text-gray-500 text-xs mt-3">Server will be ready in about 30-60 seconds</p>
                    </div>
                )}

                {/* Server List */}
                {servers.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-16 text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </div>
                        <p className="text-gray-300 text-lg font-medium mb-2">No servers yet</p>
                        <p className="text-gray-500 text-sm mb-6">Deploy your first game server and start playing with friends</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            Create Your First Server
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