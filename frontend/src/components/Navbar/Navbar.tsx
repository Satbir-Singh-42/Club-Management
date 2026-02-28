import { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { getToken, isLoggedIn } from "@/utils/getLoginDetails";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [loginStatus, setLoginStatus] = useState(isLoggedIn());
  const [, setUserType] = useState(getToken()?.userType);
  const [isOpen, setIsOpen] = useState(false);

  const onLogout = () => {
    localStorage.removeItem("token");
    setLoginStatus(false);
    setUserType(undefined);

    // Dispatch a custom event to trigger a re-render
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className={`"container mx-auto px-4 ${isOpen ? "pb-4" : "pb-0"}`}>
        <div className="flex justify-between items-center py-4">
          {/* Logo, Title, and Clubs & Societies Link */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center space-x-2">
              <img
                src="/gndec.svg" // Replace with the actual path to the logo
                alt="gndec-logo"
                className="w-12"
              />
              <span className="text-xl font-extrabold text-gray-900 font-sans">
                Club Hub
              </span>
            </a>
            {/* Only visible on larger screens (Desktop and up) */}
            <Link
              to="/clubpage"
              className="text-gray-500 hover:text-gray-700 text-[16px] hidden lg:block">
              Clubs & Societies
            </Link>
          </div>

          <div className="flex gap-1">
            {/* Navbar Links */}
            <div
              className={`${
                isOpen ? "block" : "hidden"
              } lg:flex lg:space-x-8 items-center`}>
              {/* Only visible on large screens (lg and up) */}
              {loginStatus && (
                <button
                  className="bg-blue-500 text-white px-4 py-2.5 rounded-md hover:bg-blue-600 hidden lg:block"
                  onClick={() => onLogout()}>
                  Logout
                </button>
              )}

              {!loginStatus && (
                <>
                  <button
                    className="bg-blue-500 text-white px-4 py-2.5 rounded-md hover:bg-blue-600 hidden lg:block"
                    onClick={() => navigate("/register")}>
                    Join Club Hub
                  </button>
                  <button
                    className="text-[rgb(2,7,138)] border border-gray-200 px-6 py-2 rounded-md hover:bg-blue-100 hidden lg:block shadow-md"
                    onClick={() => navigate("/login")}>
                    Sign in
                  </button>
                </>
              )}
            </div>

            {/* Hamburger / Cross Icon Button for Mobile */}
            <button
              className="block lg:hidden text-gray-600 focus:outline-none z-50"
              onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu: Only visible on small screens */}
        {isOpen && (
          <div className="lg:hidden bg-white shadow-md mt-2 rounded-lg">
            <Link
              to="/clubpage"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-center mx-auto">
              Clubs & Societies
            </Link>
            {loginStatus ? (
              <button
                className="block w-full text-center bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600"
                onClick={() => onLogout()}>
                Logout
              </button>
            ) : (
              <>
                <button
                  className="block w-full text-center bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600"
                  onClick={() => navigate("/register")}>
                  Join Club Hub
                </button>
                <button
                  className="block w-full text-center border text-blue-500 px-4 py-2 mt-2 rounded-md hover:bg-blue-100"
                  onClick={() => navigate("/login")}>
                  Sign in
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
