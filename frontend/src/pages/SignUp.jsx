import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base } from "../helper";
import bgImage from "../assets/sign-up.jpg";

export default function Signup() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "player",
        adminKey: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false); // <-- New loading state

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if ((name === "confirmPassword" && form.password !== value) ||
            (name === "password" && form.confirmPassword && value !== form.confirmPassword)) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setLoading(true); // start loading
        try {
            const response = await axios.post(
                `${base}/users/register`,
                {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    adminKey: form.role === "admin" ? form.adminKey : undefined
                }
            );

            if (response.status === 201 || response.status === 200) {
                navigate("/otp", { state: { email: form.email } });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // stop loading after request finishes
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-5xl w-full bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* Left Image Section */}
                <div className="hidden md:block">
                    <img
                        src={bgImage}
                        alt="Sign Up"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right Form Section */}
                <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-white text-center mb-6">Sign Up</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>

                        {/* Name */}
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />

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

                        {/* Password */}
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
                            >
                                {showPassword ? "🙈" : "👁"}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? "🙈" : "👁"}
                            </button>
                        </div>

                        {passwordError && (
                            <p className="text-red-500 text-sm">{passwordError}</p>
                        )}

                        {/* Role Selection */}
                        <div className="flex space-x-4 text-white">
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="player"
                                    checked={form.role === "player"}
                                    onChange={handleChange}
                                /> Player
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="facility_owner"
                                    checked={form.role === "facility_owner"}
                                    onChange={handleChange}
                                /> Facility Owner
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={form.role === "admin"}
                                    onChange={handleChange}
                                /> Admin
                            </label>
                        </div>

                        {/* Admin Key */}
                        {form.role === "admin" && (
                            <input
                                type="text"
                                name="adminKey"
                                placeholder="Admin Key"
                                value={form.adminKey}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold transition"
                        >
                            {loading ? "Loading..." : "Sign Up"}
                        </button>

                        {/* Redirect to Login */}
                        <p className="text-center text-white mt-4">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="underline hover:text-yellow-300"
                            >
                                Login
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
