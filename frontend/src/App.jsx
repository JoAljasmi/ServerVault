import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";

function App() {
  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={isLoggedIn() ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;