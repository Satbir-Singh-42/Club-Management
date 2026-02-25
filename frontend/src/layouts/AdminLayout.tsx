import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/superAdminComponents/Sidebar";
import { Header } from "@/components/superAdminComponents/Header";
const AdminLayout = () => {
  return (
    <div>
      <Sidebar/>
      <Header/>
      <main className="pl-64 pt-16">
        <Outlet /> {/* Renders child components here */}
      </main>
    </div>
  );
};

export default AdminLayout;
