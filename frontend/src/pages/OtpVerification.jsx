import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { base } from "../helper"; // <-- base URL
import otpImage from "../assets/login.jpg";
import Breadcrumb from "../components/Breadcrumb";

const OtpVerification = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <-- loading state
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    setLoading(true); // start loading
    setError("");

    try {
      const res = await axios.post(`${base}/users/verify-otp`, {
        email,
        otp: enteredOtp,
      });

      if (res.status === 200) {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false); // stop loading
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
        {/* Left Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src={otpImage}
            alt="OTP"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center items-center text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">QUICKCOURT</h1>
          <p className="flex items-center mb-4 text-sm sm:text-base">
            <span role="img" aria-label="lock" className="mr-2">
              🔒
            </span>{" "}
            VERIFY YOUR EMAIL
          </p>

          <p className="text-green-400 mb-6 text-center text-sm sm:text-base">
            We’ve sent a code to your email:{" "}
            <span className="font-mono">{email}</span>
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center"
          >
            <div className="flex gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg border border-gray-400 rounded-lg bg-transparent text-white focus:outline-none focus:border-purple-500"
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
              type="submit"
              disabled={loading} // disable while loading
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition text-sm sm:text-base"
            >
              {loading ? "Loading..." : "Verify & Continue"}
            </button>
          </form>

          <div className="mt-4 text-xs sm:text-sm text-gray-300 text-center">
            Didn’t receive the code?{" "}
            <button type="button" className="text-blue-400 hover:underline">
              Resend OTP
            </button>
          </div>
          <div className="text-xs sm:text-sm text-gray-300 text-center">
            Wrong email?{" "}
            <button type="button" className="text-blue-400 hover:underline">
              Edit Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
