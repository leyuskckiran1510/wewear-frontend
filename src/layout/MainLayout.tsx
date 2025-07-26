import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

const MainLayout = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <Navbar />
    </>
  );
};

export default MainLayout;
