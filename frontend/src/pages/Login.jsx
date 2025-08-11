import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base } from "../helper"; // base URL in one place
import bgImage from "../assets/login.jpg";
import Breadcrumb from "../components/Breadcrumb";

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
          localStorage.setItem(
            "qc_user",
            JSON.stringify({
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              avatar: user.avatar || null,
            })
          );
        }
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative flex items-center justify-center">
      {/* Cosmic Aurora */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.4) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 70%),
          radial-gradient(ellipse at 60% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 65%)
          `,
        }}
      />
      {/* Breadcrumb Navigation */}
      <div className="absolute top-4 left-4 z-20">
        <Breadcrumb />
      </div>

      <div className="relative max-w-5xl w-full min-h-[500px] bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Image Section */}
        <div className="hidden md:block md:w-full">
          <img
            src={bgImage}
            alt="Login"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Section */}
        <div className="p-8 flex flex-col justify-center bg-black bg-opacity-40">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Login
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-lg border border-gray-400 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              autoComplete="email"
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
                className="w-full p-4 rounded-lg border border-gray-400 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-xl select-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              className="w-full p-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-shadow shadow-md hover:shadow-lg"
            >
              Login
            </button>

            {/* Signup Redirect */}
            <p className="text-center text-white mt-6 text-sm">
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
