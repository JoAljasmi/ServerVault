import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";
import FrontPage from "./pages/FrontPage";
import ServerDetail from "./pages/ServerDetail";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route
          path="/admin"
          element={
              localStorage.getItem("token") ? <Admin /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard"
          element={
            localStorage.getItem("token") ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/server/:id"
          element={
            localStorage.getItem("token") ? <ServerDetail /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;