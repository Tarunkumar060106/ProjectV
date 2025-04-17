import React from "react";

interface LogoutButtonProps {
  onLogout: () => void; // Define the prop type for the callback function
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      // Call the onLogout callback passed as a prop
      await onLogout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-300"
    >
      Logout
    </button>
  );
};

export default LogoutButton;