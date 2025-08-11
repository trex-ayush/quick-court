import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import venueImg from "../assets/login.jpg";
import sportImg from "../assets/sign-up.jpg";
import heroImg from "../assets/venue.jpg"; // Add your own big hero image

const Home = () => {
    const venues = [
        { id: 1, name: "SBR Badminton", sport: "Badminton", rating: 4.5, location: "Vishwadeep Ctr" },
        { id: 2, name: "XYZ Turf", sport: "Football", rating: 4.7, location: "City Arena" },
        { id: 3, name: "Elite Tennis", sport: "Tennis", rating: 4.3, location: "Sports Hub" },
        { id: 4, name: "Cricket Zone", sport: "Cricket", rating: 4.6, location: "Play Ground" },
        { id: 5, name: "Pool Paradise", sport: "Swimming", rating: 4.8, location: "Aqua Center" },
    ];

    const sports = [
        { id: 1, name: "Badminton", img: sportImg },
        { id: 2, name: "Football", img: sportImg },
        { id: 3, name: "Cricket", img: sportImg },
        { id: 4, name: "Swimming", img: sportImg },
        { id: 5, name: "Tennis", img: sportImg },
        { id: 6, name: "Table Tennis", img: sportImg },
    ];

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        arrows: false,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-6 py-4 shadow bg-white">
                <h1 className="text-2xl font-bold text-blue-600">QUICKCOURT</h1>
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-blue-600">Book</a>
                    <a href="#" className="hover:text-blue-600">Venues</a>
                    <a href="#" className="hover:text-blue-600">Sports</a>
                    <a href="#" className="hover:text-blue-600">About</a>
                    <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                        Login / Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                className="relative h-[400px] flex items-center justify-center text-center"
                style={{
                    backgroundImage: `url(${heroImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 text-white">
                    <h2 className="text-4xl font-bold mb-4">Find Players & Venues Near You</h2>
                    <div className="bg-white rounded-lg p-2 flex items-center shadow-lg max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search venues or players"
                            className="border-none outline-none flex-1 p-2 rounded-l-lg"
                        />
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700">
                            Search
                        </button>
                    </div>

                </div>
            </section>

            {/* Top Venues */}
            <section className="px-6 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Top Venues</h3>
                    <button className="text-blue-600 hover:underline">See All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <div key={venue.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                            <img src={venueImg} alt={venue.name} className="w-full h-40 object-cover rounded-t-lg" />
                            <div className="p-4">
                                <h4 className="font-semibold text-lg">{venue.name}</h4>
                                <p className="text-sm text-gray-500">{venue.location}</p>
                                <div className="flex justify-between text-sm mt-2">
                                    <span>{venue.sport}</span>
                                    <span>⭐ {venue.rating}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular Sports Carousel */}
            <section className="px-6 py-10 bg-gray-100">
                <h3 className="text-2xl font-bold mb-6">Popular Sports</h3>
                <Slider {...sliderSettings}>
                    {sports.map((sport) => (
                        <div key={sport.id} className="px-2">
                            <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
                                <img src={sport.img} alt={sport.name} className="w-full h-32 object-cover rounded-t-lg" />
                                <div className="p-2 text-center">
                                    <span className="font-semibold">{sport.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>

            {/* Footer */}
            <footer className="bg-blue-600 text-white mt-10">
                <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-sm">

                    {/* Shop */}
                    <div>
                        <h4 className="font-bold mb-3">Book</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:underline">Browse by sport</a></li>
                            <li><a href="#" className="hover:underline">View all venues</a></li>
                            <li><a href="#" className="hover:underline">Find a venue</a></li>
                        </ul>
                    </div>

                    {/* Sell/Trade */}
                    <div>
                        <h4 className="font-bold mb-3">Join</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:underline">Become a member</a></li>
                            <li><a href="#" className="hover:underline">How it works</a></li>
                        </ul>
                    </div>

                    {/* Finance */}
                    <div>
                        <h4 className="font-bold mb-3">Payments</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:underline">Get pricing</a></li>
                            <li><a href="#" className="hover:underline">Payment options</a></li>
                            <li><a href="#" className="hover:underline">QuickCourt Pay</a></li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="font-bold mb-3">About</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:underline">About QuickCourt</a></li>
                            <li><a href="#" className="hover:underline">Contact us</a></li>
                            <li><a href="#" className="hover:underline">Community</a></li>
                            <li><a href="#" className="hover:underline">Media</a></li>
                        </ul>
                    </div>

                    {/* Careers */}
                    <div>
                        <h4 className="font-bold mb-3">Careers</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:underline">Search jobs</a></li>
                        </ul>
                    </div>

                    {/* More */}
                    <div>
                        <h4 className="font-bold mb-3">More</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:underline">Help & Support</a></li>
                            <li><a href="#" className="hover:underline">Why QuickCourt</a></li>
                            <li><a href="#" className="hover:underline">Sports Guide</a></li>
                            <li><a href="#" className="hover:underline">Membership Plans</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-blue-500 mt-6">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs space-y-2 md:space-y-0">
                        <p>By using quickcourt.com, you consent to the monitoring and storing of your interactions with the website for improving and personalizing our services. See our <a href="#" className="underline">Privacy Policy</a> for details.</p>
                        <div className="flex space-x-4">
                            <a href="#"><i className="fab fa-youtube"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-tiktok"></i></a>
                            <a href="#"><i className="fab fa-facebook"></i></a>
                        </div>
                    </div>
                    <div className="text-center py-3 text-xs">
                        © {new Date().getFullYear()} QuickCourt Services, LLC
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;
