import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base } from "../helper"; // base URL in one place
import bgImage from "../assets/login.jpg";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${base}/users/login`,
                { email: form.email, password: form.password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                const user = response.data?.user;
                if (user) {
                    // persist only safe fields
                    localStorage.setItem("qc_user", JSON.stringify({
                      id: user._id,
                      name: user.name,
                      email: user.email,
                      phone: user.phone,
                      role: user.role,
                      avatar: user.avatar || null,
                    }));
                }
                navigate("/Home");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-5xl w-full min-h-[500px] bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
                
                {/* Left Image Section */}
                <div className="hidden md:block md:w-full">
                    <img
                        src={bgImage}
                        alt="Login"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right Form Section */}
                <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-white text-center mb-6">Login</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        
                        {/* Email */}
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />

                        {/* Password with toggle */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "🙈" : "👁"}
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
                        >
                            Login
                        </button>

                        {/* Signup Redirect */}
                        <p className="text-center text-white mt-4">
                            Don’t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="underline hover:text-yellow-300"
                            >
                                Sign Up
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
