import { useNavigate } from "react-router-dom";
import API from "../api";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await API.post("/auth/logout");
        } catch (err) {}
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <nav className="bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/Servervault-logo.png" alt="ServerVault" className="w-8 h-8 rounded-lg" />
                    <h1 className="text-lg font-bold text-white">ServerVault</h1>
                    <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">Beta</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700/50 transition"
                >
                    Log out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;