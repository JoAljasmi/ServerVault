import { useState, useEffect } from 'react';
import API from '../api';
import Navbar from '../components/Navbar';
import ServerCard from "../components/ServerCard";

function Dashboard() {
  const [servers, setServers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newServer, setNewServer] = useState({name: "", game: "CS2", max_players: 20});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch servers and stats on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try { 
      const [serversRes, statsRes] = await Promise.all([
        API.get("/servers"),
        API.get("/dashboard/stats")
      ]);
      setServers(serversRes.data);
      setStats(statsRes.data);
    }catch (err) {
      setError("Failed to load the data")
    } finally {
      setLoading(false);
    }
  };

  //server creation
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/servers", newServer);
      setShowCreate(false);
      setNewServer({name: "", game: "CS2", max_players: 20});
      fetchData();
    }catch (err){
      setError(err.response?.data?.detail || "Failed to create server")
    }
  };

  const handleAction = async (serverId, action) => {
    try {
      await API.post(`/servers/${serverId}/action`, { action });
      fetchData();
    }catch (err){
      setError("action failed")
    }
  };

  const handleDelete = async (serverId) => {
    if (!window.confirm("Are you sure you would like to delete this server?")) return;
    try{
      await API.delete(`/servers/${serverId}`);
      fetchData();
    }catch (err){
      setError("failed to delete the server")
    }
  };

  if(loading) {
    return( 
      <div className='min-h-screen bg-gray-900 flex items-center justify-center text-white'>
      Loading...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 py-8'>
        {error && (
          <div className='bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm'>
            {error}
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
            <div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
              <p className='text-gray-400 text-sm'>Total Servers</p>
              <p className='text-2xl font-bold text-white'>{stats.total_servers}</p>
            </div>
            <div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
              <p className='text-gray-400 text-sm'>Active servers</p>
              <p className='text-2xl font-bold text-green-400'>{stats.active_servers}</p>
            </div>
            <div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
              <p className='text-gray-400 text-sm'>Total Players</p>
              <p className='text-2xl font-bold text-blue-400'>{stats.total_players}</p>
            </div>
            <div className='bg-gray-800 border border-gray-700 rounded-xl p-4'>
              <p className='text-gray-400 text-sm'>Monthly cost</p>
              <p className='text-2xl font-bold text-yellow-400'>${stats.monthly_cost}</p>
            </div>
          </div>
        )}

        {/* Create Server Button */}
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-white'>Servers</h2>
          <button onClick={() => setShowCreate(!showCreate)}
          className='bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition'
          >{showCreate ? "Cancel" : "+ New Server"}
          </button>
        </div>

        {/* Create Server Form */}
        {showCreate && (
          <div className='bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6'>
            <h3 className='text-lg font-medium text-white mb-4'>Deploy a new server</h3>
            <form onSubmit={handleCreate} className='flex flex-wrap gap-4 items-end'>
              <div className='flex-1 min-w-48'>
                <label className='text-gray-300 text-sm block mb-2'>Server Name</label>
                <input
                type='text'
                value={newServer.name}
                onChange={(e)=> setNewServer({...newServer, name: e.target.value})}
                className='w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                placeholder='My Server'
                required
                />
              </div>

              {/* game select */}
              <div>
                <label className='text-gray-300 text-sm block mb-2'>Game</label>
                <select
                value={newServer.game}
                onChange={(e)=> setNewServer({...newServer, game: e.target.value})}
                className='p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                >
                  <option value="minecraft">Minecraft (9.99kr/mo)</option>
                </select>
              </div>

              {/* max player */}
              <div>
                <label className='text-gray-300 text-sm block mb-2'>Max Players</label>
                <input
                type='number'
                value={newServer.max_players}
                onChange={(e) => setNewServer({...newServer, max_players:parseInt(e.target.value)})}
                className='w-24 p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500'
                min="2"
                max="20"
                />
              </div>
              <button
              type='submit'
              className='bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition'
              >Deploy Server
              </button>
            </form>
        </div>
        )}
        
        {/* Servers List */}
        {servers.length === 0 ? (
          <div className='bg-gray-800 border border-gray-700 rounded-xl p-12 text-center'>
            <p className='text-gray-400 text-lg mb-2'>No servers yet</p>
            <p className='text-gray-500 text-sm'>Click "+ New Server" to deploy your first server</p>
          </div>  
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {servers.map((server) => (
              <ServerCard
              key={server.id}
              server={server}
              onAction={handleAction}
              onDelete={handleDelete}
              />
            ))}
          </div>
        )}
    </div>
    </div>
  );
}
export default Dashboard;
