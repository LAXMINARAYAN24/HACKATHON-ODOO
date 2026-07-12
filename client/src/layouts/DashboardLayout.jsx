import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
