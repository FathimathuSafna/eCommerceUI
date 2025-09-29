import React, { useState, useEffect } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Package, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./authModal";
import ProfileModal from "./profileModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Navigation = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const checkToken = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkToken();
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    checkToken();
    navigate("/");
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    checkToken();
  };

  // Utility function for protected navigation
  const handleProtectedNavigation = (path, message) => {
    if (!isLoggedIn) {
      toast.info(message, {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      setIsAuthModalOpen(true);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{ borderRadius: "10px", fontSize: "14px" }}
      />
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="text-2xl font-bold text-red-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              FreshCart
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <HomeOutlinedIcon className="w-6 h-6" />
              </button>

              <button
                onClick={() =>
                  handleProtectedNavigation("/orders", "Please login to view orders")
                }
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Package className="w-6 h-6" />
              </button>

              <button
                onClick={() =>
                  handleProtectedNavigation("/wishList", "Please login to view wishlist")
                }
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <FavoriteBorderIcon className="w-6 h-6" />
              </button>

              <button
                onClick={() =>
                  handleProtectedNavigation("/cart", "Please login to access your cart")
                }
                className="relative p-2 text-gray-600 hover:text-red-600"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((t, item) => t + item.quantity, 0)}
                  </span>
                )}
              </button>

              {!isLoggedIn ? (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  sx={{ textTransform: "none", color: "inherit" }}
                >
                  Login
                </Button>
              ) : (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg w-full absolute top-16 left-0 z-40 animate-slideDown">
            <div className="flex flex-col px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600"
              >
                <HomeOutlinedIcon className="w-5 h-5" /> Home
              </button>

              <button
                onClick={() => {
                  handleProtectedNavigation("/orders", "Please login to view orders");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600"
              >
                <Package className="w-5 h-5" /> Orders
              </button>

              <button
                onClick={() => {
                  handleProtectedNavigation("/wishList", "Please login to view wishlist");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600"
              >
                <FavoriteBorderIcon className="w-5 h-5" /> Wishlist
              </button>

              <button
                onClick={() => {
                  handleProtectedNavigation("/cart", "Please login to access your cart");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 relative"
              >
                <ShoppingCart className="w-5 h-5" /> Cart
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((t, item) => t + item.quantity, 0)}
                  </span>
                )}
              </button>

              {!isLoggedIn ? (
                <Button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  sx={{ textTransform: "none", color: "inherit" }}
                >
                  Login
                </Button>
              ) : (
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600"
                >
                  <User className="w-5 h-5" /> Profile
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <AuthModal
        open={isAuthModalOpen}
        handleClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setIsProfileModalOpen(false)}
        handleLogout={handleLogout}
      />
    </>
  );
};
