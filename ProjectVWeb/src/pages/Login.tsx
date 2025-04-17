import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import logo from "../assets/logo.png";


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

        if (!email || !password) {
            setError("Both email and password are required");
            setLoading(false);
            return;
        }

        // ✅ Mock Authentication (Replace with API Call)
        // if (email === "tarunsivakumarr@gmail.com" && password === "123456") {
        //     const userData = {
        //         user: { email, role: "admin" },
        //         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        //     };

        //     dispatch(loginSuccess(userData));
        //     navigate("/admin/dashboard");
        // } else {
        //     setError("Invalid email or password");
        // }

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })
            
            if(!response.ok){
                throw new Error("Invalid email or password")
            }

            const data = await response.json();
            
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            if(data.user.role === "admin"){
                navigate("/admin/dashboard")
            }
            else if(data.user.role === "teacher"){
                navigate("/teacher/dashboard")
            }
            else {
                navigate("/student/dashboard")
            }
        } catch (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-gray-900 text-white p-8 rounded-xl shadow-lg transform transition duration-500 hover:scale-105">
                <div className="flex justify-center mb-0">
                    <img src={logo} alt="Logo" className="w-90 h-25 object-cover mb-2" />
                </div>

                <h2 className="text-3xl font-bold text-center">Login</h2>
                <p className="text-sm text-gray-400 text-center mt-2">
                    Enter your credentials to access your account
                </p>

                {error && <p className="text-red-500 text-center mt-3">{error}</p>}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email Address</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 px-4 py-2 bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 px-4 py-2 bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="********"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 transition p-2 rounded-md font-medium disabled:bg-gray-600"
                        disabled={loading}
                    >
                        {loading ? <FiLoader className="animate-spin mr-2" /> : "Login"}
                    </button>
                </form>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 transition p-2 rounded-md font-medium mt-2"
                    >
                        Return To Home
                    </button>

                <p className="text-center text-gray-400 text-sm mt-4">
                    Don't have an account? 
                    <a href="/ts-register" className="text-blue-400 hover:underline ml-1">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
