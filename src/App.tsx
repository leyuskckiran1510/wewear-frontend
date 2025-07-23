import { BrowserRouter as Router } from "react-router-dom";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import FeedForYou from "./pages/FeedForYou";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feeds/foryou" element={<FeedForYou />} />
      </Routes>
    </Router>
  );
};

export default App;
