import { useNavigate } from "react-router-dom";
import API from "../api";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try{
            await API.post("/auth/logout");
        } catch (err) {
            // just here to clear locally incase it fails
        }
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700:">
            <div className="max-w-7xl mx-auto px-4 py-4 flex item-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/Servervault-logo.png" alt="ServerVault" className="w-8 h-8 rouned-lg"/>
                    <h1 className="text-xl font-bold text-white">ServerVault</h1>
                </div>

                <button onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                    Logout
                </button>
            </div>
        </nav>
    );
}
export default Navbar;