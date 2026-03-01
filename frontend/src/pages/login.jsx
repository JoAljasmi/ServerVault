import { use, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handlelogin = async (e) => {
        e.preventDefault();
        setError("");

        try { 
            //sending as form data to see if it matcches the backend
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await API.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            localStorage.setItem("token", response.data.access_token);
            navigate("/dashboard");
        } catch (err){
            setError(err.response?.data?.detail || "login failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray 900 flex item-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg- w-full max-w-md">
                <h1 className="text-3xl font-bold text-white text-center mb-2">
                    ServerVault
                </h1>
                <p className="text-gray-400 text-center mb-6">
                    Sign in to manage your servers
                </p>

                {error && (
                    <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handlelogin} className="space-y-4">
                    <div>
                        <label className="text-gray-300 text-sm block mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-700 text-white border border-gray-600 focus:borer-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm block mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-gray-400 text-center mt-4 text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-400 hover:underline">
                    Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;