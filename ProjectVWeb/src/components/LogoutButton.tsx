import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            dispatch(logout());
            localStorage.removeItem("token");  // ✅ Clear token in localStorage
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                dispatch(logout());
                localStorage.removeItem("token"); // ✅ Ensure token is removed
                navigate("/login");
            } else {
                console.error("Failed to logout");
                if (response.status === 401) { // ✅ Handle token expiry
                    localStorage.removeItem("token");
                    dispatch(logout());
                    navigate("/login");
                }
            }
        } catch (error) {
            console.error("Error logging out:", error);
            localStorage.removeItem("token"); // ✅ Handle logout even if backend fails
            dispatch(logout());
            navigate("/login");
        }
    };

    return (
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
            Logout
        </button>
    );
};

export default LogoutButton;
