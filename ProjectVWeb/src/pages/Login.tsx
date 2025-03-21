import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Basic validation
        if (!email || !password) {
            setError("Both email and password are required");
            setLoading(false);
            return;
        }

        // ✅ Mock Admin Credentials (Replace with API Call Later)
        if (email === "tarunsivakumarr@gmail.com" && password === "123456") {
            const userData = {
                user: { email: "tarunsivakumarr@gmail.com", role: "admin" },
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDU2ZDkxMjA3ZjQ1NzhmM2QzOTc5NyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MjU1MTE5MywiZXhwIjoxNzQyNjM3NTkzfQ.qVLQR-TuM3MUU-MCX8FlzItNT45xmXz09NetrP8MNEU",
            };

            dispatch(loginSuccess(userData)); // ✅ Correct dispatch with user & token
            navigate("/admin/dashboard");
        } else {
            setError("Invalid email or password");
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <button 
                        type="submit" 
                        className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white'}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
