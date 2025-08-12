import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base } from "../helper";
import bgImage from "../assets/sign-up.jpg";
import Breadcrumb from "../components/Breadcrumb";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "player",
    adminKey: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password strength validation
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        if (!value) {
          newErrors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        const passwordError = validatePassword(value);
        if (passwordError) {
          newErrors.password = passwordError;
        } else {
          delete newErrors.password;
        }

        // Check confirm password match if it exists
        if (form.confirmPassword && value !== form.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (form.confirmPassword && value === form.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case "confirmPassword":
        if (value !== form.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case "adminKey":
        if (form.role === "admin" && !value.trim()) {
          newErrors.adminKey = "Admin key is required for admin role";
        } else {
          delete newErrors.adminKey;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors({ ...errors, general: "" });
    }

    // Validate field in real-time
    validateField(name, value);
  };

  // Form validation before submission
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm password validation
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Admin key validation
    if (form.role === "admin" && !form.adminKey.trim()) {
      newErrors.adminKey = "Admin key is required for admin role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      const response = await axios.post(`${base}/users/register`, {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        role: form.role,
        adminKey: form.role === "admin" ? form.adminKey.trim() : undefined,
      });

      if (response.status === 201 || response.status === 200) {
        navigate("/otp-verification", { state: { email: form.email } });
      }
    } catch (error) {
      console.error("Signup error:", error);

      // Handle different types of errors
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            if (data.message?.toLowerCase().includes("email")) {
              setErrors({ email: data.message || "Invalid email format" });
            } else if (data.message?.toLowerCase().includes("password")) {
              setErrors({ password: data.message || "Invalid password" });
            } else if (data.message?.toLowerCase().includes("admin")) {
              setErrors({ adminKey: data.message || "Invalid admin key" });
            } else {
              setErrors({ general: data.message || "Invalid input data" });
            }
            break;

          case 409:
            setErrors({
              email:
                data.message ||
                "An account with this email already exists. Please use a different email or try logging in.",
            });
            break;

          case 401:
            setErrors({
              adminKey:
                data.message ||
                "Invalid admin key. Please check your admin credentials.",
            });
            break;

          case 422:
            // Handle validation errors from server
            if (data.errors && Array.isArray(data.errors)) {
              const fieldErrors = {};
              data.errors.forEach((err) => {
                if (err.field) {
                  fieldErrors[err.field] = err.message;
                }
              });
              setErrors(fieldErrors);
            } else {
              setErrors({ general: data.message || "Validation failed" });
            }
            break;

          case 500:
            setErrors({
              general: "Server error occurred. Please try again later.",
            });
            break;

          default:
            setErrors({
              general: data.message || `Registration failed (Error ${status})`,
            });
        }
      } else if (error.request) {
        // Network error
        setErrors({
          general:
            "Network error. Please check your internet connection and try again.",
        });
      } else {
        // Other error
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
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
      <div className="absolute top-4 left-4 z-20">
        <Breadcrumb />
      </div>

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
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Sign Up
          </h2>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  errors.name
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-300 bg-white/30"
                } text-white placeholder-white/80 focus:outline-none focus:ring-2 ${
                  errors.name ? "focus:ring-red-300" : "focus:ring-purple-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-300 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  errors.email
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-300 bg-white/30"
                } text-white placeholder-white/80 focus:outline-none focus:ring-2 ${
                  errors.email ? "focus:ring-red-300" : "focus:ring-purple-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    errors.password
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-300 bg-white/30"
                  } text-white placeholder-white/80 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "focus:ring-red-300"
                      : "focus:ring-purple-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    errors.confirmPassword
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-300 bg-white/30"
                  } text-white placeholder-white/80 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "focus:ring-red-300"
                      : "focus:ring-purple-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="flex space-x-4 text-white">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="player"
                  checked={form.role === "player"}
                  onChange={handleChange}
                  className="text-purple-600"
                />
                <span>Player</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={form.role === "owner"}
                  onChange={handleChange}
                  className="text-purple-600"
                />
                <span>Facility Owner</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === "admin"}
                  onChange={handleChange}
                  className="text-purple-600"
                />
                <span>Admin</span>
              </label>
            </div>

            {/* Admin Key */}
            {form.role === "admin" && (
              <div>
                <input
                  type="password"
                  name="adminKey"
                  placeholder="Admin Key"
                  value={form.adminKey}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    errors.adminKey
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-300 bg-white/30"
                  } text-white placeholder-white/80 focus:outline-none focus:ring-2 ${
                    errors.adminKey
                      ? "focus:ring-red-300"
                      : "focus:ring-purple-300"
                  }`}
                />
                {errors.adminKey && (
                  <p className="text-red-300 text-sm mt-1">{errors.adminKey}</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Redirect to Login */}
            <p className="text-center text-white mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="underline hover:text-yellow-300 transition-colors duration-200"
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
