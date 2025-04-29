import React from 'react';
import { useNavigate } from 'react-router-dom';

const Top = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear session if needed
    navigate('/login');
  };

  const goToBookings = () => navigate('/bookings');
  const goToUserVehicleList = () => navigate('/UserVehicleList');

  return (
    <header className="w-full bg-[#0e1a2b] border-b border-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-400 tracking-wide cursor-pointer hover:text-cyan-400 transition"
          onClick={goToUserVehicleList}
        >
          SK Rentals
        </div>

        {/* Nav */}
        <nav>
          <ul className="flex space-x-6 text-sm sm:text-base font-medium text-gray-200">
            <li>
              <button
                onClick={goToUserVehicleList}
                className="hover:text-blue-400 transition duration-200"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={goToBookings}
                className="hover:text-blue-400 transition duration-200"
              >
                My Bookings
              </button>
            </li>
            <li>
              <button
                onClick={() => alert('Coming soon!')}
                className="hover:text-blue-400 transition duration-200"
              >
                Settings
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-600 transition duration-200"
              >
                Logout
              </button>
            </li>
            <li>
              <a href="/login">
                <img
                  src="/image/th.jpg"
                  alt="Login"
                  className="w-10 h-10 rounded-full border-2 border-blue-600 hover:border-cyan-300 transition duration-200"
                />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Top;
