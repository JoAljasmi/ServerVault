// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await API.post("/auth/login", formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        localStorage.setItem("token", response.data.access_token);
        navigate("/dashboard");
        } catch (err) {
        setError(err.response?.data?.detail || "Login failed, please use the correct username and password.");
        } finally {
        setLoading(false);
        }
};

return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: "linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39 ,0.95)), url('gaming-bg.jpg') center/cover fixed"}}>
    <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">ServerVault</h1>
            <p className="text-gray-400 mt-2">Game server hosting made simple</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">Username</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Enter your username"
                required
            />
            </div>

            <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Enter your password"
                required
            />
            </div>

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg transition mt-2"
            >
            {loading ? "Signing in..." : "Sign In"}
            </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Create one for free
            </Link>
            </p>
        </div>
        </div>

        {/* Features placed on the bottom*/}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="text-gray-500">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-xs">CS2, Rust &<br/>Minecraft</div>
        </div>
        <div className="text-gray-500">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs">Real-time<br/>Monitoring</div>
        </div>
        <div className="text-gray-500">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs">Instant<br/>Deployment</div>
        </div>
        </div>
    </div>
    </div>
);
}

export default Login;