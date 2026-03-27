import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/auth/me")
            .then(res => setUser(res.data))
            .catch(() => {});
    }, []);

    const handleLogout = async () => {
        try {
            await API.post("/auth/logout");
        } catch (err) {}
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img src="/Servervault-logo.png" alt="ServerVault" className="w-8 h-8 rounded-lg" />
                        <h1 className="text-lg font-bold text-white">ServerVault</h1>
                    </Link>
                    <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">Beta</span>
                </div>

                <div className="flex items-center gap-3">
                    {user?.is_admin && (
                        <Link
                            to="/admin"
                            className="text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded-lg hover:bg-gray-700/50 transition flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700/50 transition"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;