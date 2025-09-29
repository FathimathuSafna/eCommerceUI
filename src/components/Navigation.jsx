import React, { useState, useEffect } from "react";
import { Menu, X, Search, ShoppingCart, Package, User } from "lucide-react";
import { Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./authModal"; 
import ProfileModal from "./profileModal"; 

// --- Navigation Component ---
export const Navigation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
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
    return () => {
      window.removeEventListener("storage", checkToken);
    };
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

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-red-600 cursor-pointer" onClick={() => navigate("/")}>
              FreshCart
            </div>

            {/* <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for restaurants or dishes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div> */}

            <div className="flex items-center space-x-4">
              <button onClick={() => navigate("/")} className="p-2 text-gray-600 hover:text-red-600">
                <HomeOutlinedIcon className="w-6 h-6" />
              </button>
              <button onClick={() => navigate("/orders")} className="p-2 text-gray-600 hover:text-gray-900">
                <Package className="w-6 h-6" />
              </button>
              <button onClick={() => navigate("/wishList")} className="p-2 text-gray-600 hover:text-red-600">
                <FavoriteBorderIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsAuthModalOpen(true);
                  } else {
                    navigate("/cart");
                  }
                }}
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
                <Button onClick={() => setIsAuthModalOpen(true)} sx={{ textTransform: "none", color: "inherit" }}>
                  Login
                </Button>
              ) : (
                <button onClick={() => setIsProfileModalOpen(true)} className="p-2 text-gray-600 hover:text-red-600">
                  <User className="w-6 h-6" />
                </button>
              )}

              <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <AuthModal 
        open={isAuthModalOpen} 
        handleClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* ✅ Use the imported ProfileModal component */}
      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setIsProfileModalOpen(false)}
        handleLogout={handleLogout}
      />
    </>
  );
};