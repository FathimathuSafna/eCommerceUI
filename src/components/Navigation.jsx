import React, { useState, useEffect } from "react";
import { Menu, X, Search, ShoppingCart, Package, User } from "lucide-react";
import { Button, Box, Modal, Typography, TextField, Link } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

// --- Mock API functions for demonstration ---
const mockLogin = async (credentials) => {
  console.log("Attempting to log in with:", credentials);
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = { success: true, token: "fake-jwt-token-for-demo" };
      localStorage.setItem("token", response.token);
      resolve(response);
    }, 1000);
  });
};

const mockSignup = async (userData) => {
  console.log("Attempting to sign up with:", userData);
  return new Promise((resolve) => {
    setTimeout(() => {
       const response = { success: true, token: "fake-jwt-token-for-new-user" };
       localStorage.setItem("token", response.token);
       resolve(response);
    }, 1000);
  });
};

// --- Modal Style ---
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

// --- AuthModal Component ---
const AuthModal = ({ open, handleClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();



  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password should be of minimum 6 characters length")
      .required("Password is required"),
    fullName: Yup.string().when([], {
      is: () => !isLogin,
      then: (schema) => schema.required("Full Name is required"),
    }),
    number: Yup.string().when([], {
        is: () => !isLogin,
        then: (schema) => schema
            .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
            .required("Phone number is required"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      number: "", 
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let response;
        if (isLogin) {
          response = await mockLogin({
            email: values.email,
            password: values.password,
          });
          console.log("Login successful:", response);
        } else {
          response = await mockSignup({
            fullName: values.fullName,
            email: values.email,
            number: values.number,
            password: values.password,
          });
          console.log("Signup successful:", response);
        }
        if (response.success) {
          onAuthSuccess();
        }
      } catch (error) {
        console.error("Authentication failed:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    formik.resetForm();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          {isLogin ? "Login" : "Sign Up"}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          {!isLogin && (
            <TextField
              fullWidth
              id="fullName"
              name="fullName"
              label="Full Name"
              margin="normal"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
              disabled={formik.isSubmitting}
            />
          )}
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={formik.isSubmitting}
          />
          {!isLogin && (
            <TextField
              fullWidth
              id="number"
              name="number"
              label="Phone Number"
              margin="normal"
              value={formik.values.number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.number && Boolean(formik.errors.number)}
              helperText={formik.touched.number && formik.errors.number}
              disabled={formik.isSubmitting}
            />
          )}
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={formik.isSubmitting}
          />
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            sx={{ mt: 2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Submitting..." : (isLogin ? "Login" : "Sign Up")}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          {isLogin ? "Don’t have an account? " : "Already have an account? "}
          <Link component="button" variant="body2" onClick={toggleAuthMode}>
            {isLogin ? "Sign Up" : "Login"}
          </Link>
        </Typography>
      </Box>
    </Modal>
  );
};

// --- ProfileModal Component ---
const ProfileModal = ({ open, handleClose, handleLogout }) => {
  // Mock user data. In a real app, this would come from an API or global state.
  const userDetails = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
  };

  const onLogoutClick = () => {
    handleLogout();
    handleClose(); // Also close the modal
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          My Profile
        </Typography>
        <Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Name:</strong> {userDetails.name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            <strong>Email:</strong> {userDetails.email}
          </Typography>
          <Button
            color="error"
            variant="contained"
            fullWidth
            onClick={onLogoutClick}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};


// --- Navigation Component ---
export const Navigation = ({ transparent }) => {
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State for the new modal

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
    checkToken();
    navigate("/");
  };
  
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    checkToken();
  };

  return (
    <>
      <navbar className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-red-600">FreshCart</div>

            <div className="flex-1 max-w-lg mx-8 hidden md:block">
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
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <HomeOutlinedIcon className="w-6 h-6" />
              </button>

              <button
                onClick={() => navigate("/orders")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Package className="w-6 h-6" />
              </button>

              <button
                onClick={() => navigate("/wishList")}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <FavoriteBorderIcon className="w-6 h-6" />
              </button>

              {!isLoggedIn ? (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  sx={{ textTransform: "none", color: "inherit" }}
                >
                  Login
                </Button>
              ) : (
                // When logged in, show a single user icon to open the profile modal
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <User className="w-6 h-6" />
                </button>
              )}

              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 text-gray-600 hover:text-red-600"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((t, item) => t + item.quantity, 0)}
                  </span>
                )}
              </button>

              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </navbar>
      
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

