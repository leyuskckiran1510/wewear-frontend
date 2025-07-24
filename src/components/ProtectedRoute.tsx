import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const isAuthenticated = () => !!localStorage.getItem("token");

const ProtectedRoute: React.FC < ProtectedRouteProps > = ({ children }) => {
    if (!isAuthenticated()) {
        toast.error("Must login")
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;