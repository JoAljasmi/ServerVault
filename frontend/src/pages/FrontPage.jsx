import { Link } from "react-router-dom";

function FrontPage() {
    return(
        <div className="min-h-screen bg-gray-900" style={{background: "linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.95)), url('/gaming-bg.jpg') center/cover fixed"}}>
            {/* Navbar */}
            <nav className="border-b border-gray-800 sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm">
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
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
                        <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-2">Minecraft Servers</h3>
                        <p className="text-gray-400 text-sm">
                            Deploy a Minecraft Java server in seconds. Supports up to 20 players with real-time monitoring.
                        </p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                        <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-2">CS2 Servers</h3>
                        <p className="text-gray-400 text-sm">
                            Host your own Counter-Strike 2 dedicated server. Competitive 5v5 or casual — your choice.
                        </p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
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
                        <div className="w-14 h-14 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold mb-2">1. Create Account</h3>
                        <p className="text-gray-400 text-sm">Sign up with email verification in under a minute</p>
                    </div>
                    <div className="text-center">
                        <div className="w-14 h-14 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold mb-2">2. Deploy Server</h3>
                        <p className="text-gray-400 text-sm">Pick your game, name your server, and click deploy</p>
                    </div>
                    <div className="text-center">
                        <div className="w-14 h-14 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold mb-2">3. Start Playing</h3>
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
                    <p className="text-gray-600 text-sm">A project by Josef</p>
                </div>
            </footer>
        </div>
    );
}

export default FrontPage;