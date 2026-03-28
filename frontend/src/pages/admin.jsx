import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

function Admin() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [servers, setServers] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [statsRes, usersRes, serversRes] = await Promise.all([
                API.get("/admin/stats"),
                API.get("/admin/users"),
                API.get("/admin/servers"),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setServers(serversRes.data);
        } catch (err) {
            if (err.response?.status === 403) {
                navigate("/dashboard");
            } else {
                setError("Failed to load admin data");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Delete user "${username}" and all their servers?`)) return;
        try {
            await API.delete(`/admin/users/${userId}`);
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to delete user");
        }
    };

    const handleDeleteServer = async (serverId) => {
        if (!window.confirm("Delete this server?")) return;
        try {
            await API.delete(`/admin/servers/${serverId}`);
            fetchAll();
        } catch (err) {
            setError("Failed to delete server");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "users", label: "Users" },
        { id: "servers", label: "Servers" },
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Manage users and servers</p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit mb-8">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        activeTab === tab.id
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-400 text-sm">Verified Users</p>
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{stats.verified_users}</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-400 text-sm">Total Servers</p>
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-400">{stats.total_servers}</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-400 text-sm">Running Servers</p>
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">{stats.running_servers}</p>
                </div>
            </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left text-gray-400 text-sm font-medium p-4">User</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Email</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Status</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Servers</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Joined</th>
                            <th className="text-right text-gray-400 text-sm font-medium p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{user.username}</span>
                                        {user.is_admin && (
                                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Admin</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400 text-sm">{user.email}</td>
                                <td className="p-4">
                                    {user.is_verified ? (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Verified</span>
                                    ) : (
                                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Unverified</span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-300 text-sm">{user.server_count}</td>
                                <td className="p-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                    {server.status === "running" ? (
                                    <button
                                        onClick={async () => {
                                            await API.post(`/admin/servers/${server.id}/action`, { action: "stop" });
                                            fetchAll();
                                        }}
                                        className="text-yellow-400 hover:text-yellow-300 transition"
                                        title="Stop"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 6h12v12H6z" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            await API.post(`/admin/servers/${server.id}/action`, { action: "start" });
                                            fetchAll();
                                        }}
                                        className="text-green-400 hover:text-green-300 transition"
                                        title="Start"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        await API.post(`/admin/servers/${server.id}/action`, { action: "restart" });
                                        fetchAll();
                                    }}
                                    className="text-blue-400 hover:text-blue-300 transition"
                                    title="Restart"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDeleteServer(server.id)}
                                    className="text-red-400 hover:text-red-300 transition"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Servers Tab */}
        {activeTab === "servers" && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Server</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Game</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Status</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">Owner</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">CPU</th>
                            <th className="text-left text-gray-400 text-sm font-medium p-4">RAM</th>
                            <th className="text-right text-gray-400 text-sm font-medium p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servers.map((server) => (
                            <tr key={server.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                <td className="p-4">
                                    <div>
                                        <p className="text-white font-medium">{server.name}</p>
                                        <p className="text-gray-500 text-xs font-mono">{server.ip_address}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{server.game.toUpperCase()}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        server.status === "running"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-red-500/20 text-red-400"
                                    }`}>
                                        {server.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-300 text-sm">{server.owner}</td>
                                <td className="p-4 text-gray-300 text-sm">{server.cpu_usage}%</td>
                                <td className="p-4 text-gray-300 text-sm">{server.ram_usage}%</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDeleteServer(server.id)}
                                        className="text-red-400 hover:text-red-300 text-sm transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {servers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">No servers on the platform yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
            </div>
        </div>
    );
}

export default Admin;