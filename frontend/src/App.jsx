import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import OtpVerification from "./pages/OtpVerification";
import Home from "./pages/Home";
<<<<<<< HEAD
=======
import Profile from "./pages/Profile";
// import VenueBooking from "./pages/VenueBooking";
// import VenueDetails from "./pages/VenueDetails";
>>>>>>> fe9f0b212706952e05fd90526d6a39c65216719b

const App = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative">
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

      {/* Page Content */}
      <div className="relative z-10">
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/otp" element={<OtpVerification />} />
<<<<<<< HEAD
            <Route path="/" element={<Home />} />
=======
            <Route path="/" element={<Home/>} />
            <Route path="/Profile" element={<Profile/>} />
            {/* <Route path="/VenueBooking" element={<VenueBooking/>} />
            <Route path="/venue-details" element={<VenueDetails/>} /> */}
>>>>>>> fe9f0b212706952e05fd90526d6a39c65216719b
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;
