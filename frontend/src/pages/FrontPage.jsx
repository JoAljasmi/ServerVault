import { Link } from "react-router-dom";

function FrontPage() {
    return(
        <div className="min-h-screen bg-gray-900">
            {/* Navbar */}
            <nav className="border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/Servervault-logo.png" alt="ServerVault" className="w-8 h-8 rounded-lg" />
                        <span className="text-lg font-bold text-white">ServerVault</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-gray-400 hover:text-white text-sm px-4 py-2 transition">
                            Sign In
                        </Link>
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition">
                            Get started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                <div className="inline-block bg-blue-600/10 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6 border border-blue-600/20">
                Now supporting Minecraft servers!
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Game server Hosting<br />
                    <span className="text-blue-500">Made Simple</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                    Deploy, manage, and monitor your game servers from one dashboard.
                    Real time stats, instant deployment, and AI powered assistance.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-lg transition">
                        Start Hosting
                    </Link>
                    <Link to="/login" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-8 py-3 rounded-lg font-semibold text-lg border border-gray-700 transition">
                        Sign In
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">⛏️</div>
                    <h3 className="text-white text-lg font-semibold mb-2">Minecraft Servers</h3>
                    <p className="text-gray-400 text-sm">
                        Deploy a Minecraft Java server in seconds. Supports up to 20 players with real-time monitoring.
                    </p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                        <div className="text-4xl mb-4">🔫</div>
                        <h3 className="text-white text-lg font-semibold mb-2">CS2 Servers</h3>
                        <p className="text-gray-400 text-sm">
                            Host your own Counter-Strike 2 dedicated server. Competitive 5v5 or casual — your choice.
                        </p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-white text-lg font-semibold mb-2">AI Assistant</h3>
                        <p className="text-gray-400 text-sm">
                            Get help with server configuration, troubleshooting, and optimization from our built-in AI.
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">1</div>
                        <h3 className="text-white font-semibold mb-2">Create Account</h3>
                        <p className="text-gray-400 text-sm">Sign up with email verification in under a minute</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">2</div>
                        <h3 className="text-white font-semibold mb-2">Deploy Server</h3>
                        <p className="text-gray-400 text-sm">Pick your game, name your server, and click deploy</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">3</div>
                        <h3 className="text-white font-semibold mb-2">Start Playing</h3>
                        <p className="text-gray-400 text-sm">Share the IP with friends and jump into your game</p>
                    </div>
                </div>
            </div>

            {/* Stats Banner */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-xl p-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-white">99.9%</p>
                            <p className="text-gray-400 text-sm mt-1">Uptime</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">2</p>
                            <p className="text-gray-400 text-sm mt-1">Supported Games</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="text-gray-400 text-sm mt-1">AI Support</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">$9.99</p>
                            <p className="text-gray-400 text-sm mt-1">Starting Price</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-16">
                <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/Servervault-logo.png" alt="ServerVault" className="w-6 h-6 rounded" />
                        <span className="text-gray-500 text-sm">ServerVault © 2026</span>
                    </div>
                    <p className="text-gray-600 text-sm">A school project by Josef</p>
                </div>
            </footer>
        </div>
    );
}

export default FrontPage;