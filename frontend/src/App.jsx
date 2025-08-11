import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OtpVerification from "./pages/OtpVerification";
import Profile from "./pages/Profile";
import VenueDetails from "./pages/VenueDetails";
import AddVenue from "./pages/AddVenue";
import AllVenues from "./pages/AllVenues";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UpdateVenue from "./pages/UpdateVenue";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerAdminRoute from "./components/OwnerAdminRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/venues" element={<AllVenues />} />
          <Route path="/venues/:id" element={<VenueDetails />} />
          <Route
            path="/venues/new"
            element={
              <OwnerAdminRoute>
                <AddVenue />
              </OwnerAdminRoute>
            }
          />
          <Route
            path="/venues/:venueId/edit"
            element={
              <OwnerAdminRoute>
                <UpdateVenue />
              </OwnerAdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/dashboard"
            element={
              <OwnerAdminRoute>
                <OwnerDashboard />
              </OwnerAdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <OwnerAdminRoute>
                <AdminDashboard />
              </OwnerAdminRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
