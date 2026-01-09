import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  );
};

export default Dashboard;
