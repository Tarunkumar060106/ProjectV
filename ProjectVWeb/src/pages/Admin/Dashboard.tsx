import React from "react";
import LogoutButton from "../../components/LogoutButton";

const AdminDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <LogoutButton />
        </div>
    );
};

export default AdminDashboard;
