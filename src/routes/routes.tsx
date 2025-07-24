import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router-dom";
import Login from "@/pages/Login";
import Logout from "@/pages/Logout";
import Profile from "@/pages/Profile";
import Feed from "@/pages/Feed";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layout/MainLayout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/feeds/foryou",
        element: <Feed feedType="foryou" />,
      },
      {
        path: "/feeds/friends",
        element: <Feed feedType="friends" />,
      },
      {
        path: "/feeds/explore",
        element: <Feed feedType="explore" />,
      },
      {
        path: "/feeds/upload",
        element: <Feed feedType="upload" />,
      },
    ],
  },
];

export default routes;
