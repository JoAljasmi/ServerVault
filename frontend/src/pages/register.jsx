import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await API.post("/auth/register", {username, email, password});
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (            
        <div className="min-h-screen flex items-center justify-center px-4"
        style={{
            background:"Linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.95)), url('/gaming-bg.jpg') center/cover fixed",
        }}>
            {/* Logo and background */}
            <div className="w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="inline-flex- items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <img src="/Servervault-logo.png" alt="ServerVault" className="w-16 h-16 rounded-2xl mb-4" />
                    </div>
                    <h1 className="text-4xl font-bold text-white">ServerVault</h1>
                    <p className="text-gray-400 mt-2">Create your account</p>
            </div>
                {/* Registration Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Get started for free</h2>
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleRegister} className="space-y-5">
                {/* Username, email and password fields */}
                <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                        placeholder="Choose a username"
                        required
                    />
                </div>
                <div>
                    
                    <label className="text-gray-300 text-sm font-medium block mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                        placeholder="you@example.com"
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
                        placeholder="Create a password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg transition mt-2">
                        {loading ? "Creating your account...": "Create Account"}
                    </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign in
                    </Link>
                </p>
                </div>
            </div>  
        </div>
    </div>
    );
}

export default Register;