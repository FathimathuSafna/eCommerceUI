import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./pages/Dashboard";
import Cart from "./pages/cart";
import WishList from "./pages/wishList";
import { OrderPage } from "./pages/orders";
import { RestaurantListUI } from "./pages/restaurantList";
import { FoodDisplayUI } from "./pages/FoodList";
import { CombinedSearchUI } from "./pages/Search";
import AdminDashboard from "./pages/admin/adminDashboard";
import { AdminLogin } from "./pages/admin/adminLogin";
import "./App.css";

// --- Improved ProtectedRoute Component ---
const ProtectedRoute = ({ children }) => {
  // Use a specific token name for the admin
  const token = localStorage.getItem("adminToken");

  if (!token) {
    // If no token exists, redirect the user to the admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // If a token exists, render the child component (the AdminDashboard)
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* The <Navigation /> component is not used here. You might want to add a layout for user-facing pages */}
        <Routes>
          {/* User-facing Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<CombinedSearchUI />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/wishList" element={<WishList />} />
          <Route path="/restaurants" element={<RestaurantListUI />} />
          <Route path="/food" element={<FoodDisplayUI />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;