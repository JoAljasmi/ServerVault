import { useState, useEffect } from 'react';
import API from '../api';

function Dashboard() {
  const [servers, setServers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newServer, setNewServer] = useState({name: "", game: "cs2", max_players: 20});
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
      setNewServer({name: "", game: "cs2", max_players: 20});
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
}