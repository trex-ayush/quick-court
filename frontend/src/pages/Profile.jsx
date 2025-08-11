import React, { useState } from "react";
import profileImage from "../assets/login.jpg"; // Replace with avatar image

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: "Mitchell Admin",
    email: "mitchelladmin2017@gmail.com",
    oldPassword: "",
    newPassword: "",
    phone: "9999999999"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      oldPassword: "",
      newPassword: ""
    });
  };

  const handleSave = () => {
    alert("Profile Updated!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-black px-4">
      <div className="flex flex-col md:flex-row bg-black/40 rounded-2xl overflow-hidden shadow-lg w-full max-w-5xl text-white">

        {/* Sidebar */}
        <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col items-center">
          <img
            src={profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-purple-500"
          />
          <h2 className="text-lg font-semibold">{formData.fullName}</h2>
          <p className="text-gray-400">{formData.phone}</p>
          <p className="text-gray-400 mb-4">{formData.email}</p>

          <button className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md mb-2">
            Edit Profile
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-md">
            All Bookings
          </button>
        </div>

        {/* Profile Form */}
        <div className="w-full md:w-2/3 p-6">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-purple-500"></div>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Old Password</label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
