import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";

function Verify() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try { 
            await API.post("/auth/verify", { email, code });
            setSuccess("Email verified! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        }catch (err) {
            const detail = err.response?.data?.detail;
            if (typeof detail === "string"){
                setError(detail);
            }else {
                setError("Verification failed");
            }
        } finally {
            setLoading(false);
        }
    };

        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src="/Servervault-logo.png" alt="ServerVault" className="w-16 h-16 rounded-2xl mb-4" />
                    <h1 className="text-4xl font-bold text-white">Verify Email</h1>
                    <p className="text-gray-400 mt-2">We sent a code to {email}</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-4 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-5">
                        <div>
                            <label className="text-gray-300 text-sm font-medium block mb-2">Verification Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? "Verifying..." : "Verify Email"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Verify;