import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { base } from "../helper";

const Breadcrumb = () => {
  const location = useLocation();
  const params = useParams();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [venueName, setVenueName] = useState("");

  // Fetch venue name if we're on a venue details page
  useEffect(() => {
    if (params.id && pathnames.includes("venues")) {
      const fetchVenueName = async () => {
        try {
          const { data } = await axios.get(`${base}/venues/${params.id}`);
          const venue = data?.data || data;
          if (venue?.name) {
            setVenueName(venue.name);
          }
        } catch (error) {
          console.error("Failed to fetch venue name:", error);
        }
      };
      fetchVenueName();
    }
  }, [params.id, pathnames]);

  const getBreadcrumbName = (path) => {
    const breadcrumbMap = {
      signup: "Sign Up",
      login: "Login",
      otp: "OTP Verification",
      venues: "Venues",
      new: "Add New Venue",
      profile: "Profile",
      venue: "Venue Details",
    };

    return breadcrumbMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  const getBreadcrumbIcon = (path) => {
    const iconMap = {
      signup: "📝",
      login: "🔐",
      otp: "📱",
      venues: "🏟️",
      new: "➕",
      profile: "👤",
      venue: "🏸",
    };

    return iconMap[path] || "📄";
  };

  if (pathnames.length === 0) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            to="/"
            className="flex items-center text-gray-500 hover:text-purple-600 transition-colors duration-200"
          >
            <span className="mr-1">🏠</span>
            <span>Home</span>
          </Link>
        </li>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          
          // Use venue name if available and this is the venue ID
          let displayName = getBreadcrumbName(name);
          if (name === params.id && venueName) {
            displayName = venueName;
          }
          
          const icon = getBreadcrumbIcon(name);

          return (
            <li key={name} className="flex items-center">
              <span className="text-gray-400 mx-2">/</span>
              {isLast ? (
                <span className="flex items-center text-purple-600 font-semibold">
                  <span className="mr-1">{icon}</span>
                  <span>{displayName}</span>
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="flex items-center text-gray-500 hover:text-purple-600 transition-colors duration-200"
                >
                  <span className="mr-1">{icon}</span>
                  <span>{displayName}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
