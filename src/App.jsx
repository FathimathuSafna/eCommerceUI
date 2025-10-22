import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Dashboard } from "./pages/Dashboard";
import Cart from "./pages/cart";
import WishList from "./pages/wishList";
import { OrderPage } from "./pages/orders";
import { RestaurantListUI } from "./pages/restaurantList";
import { FoodDisplayUI} from "./pages/FoodList";
import { CombinedSearchUI } from "./pages/Search";
import AdminDashboard from "./pages/admin/adminDashboard";
import { AdminLogin } from "./pages/admin/adminLogin";
import {FoodDetailPage} from './pages/food'

import "./App.css";

const ProtectedRoute = ({ children, role }) => {
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  if (role === "admin") {
    if (!adminToken) {
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    if (!userToken) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Dashboard />} />

          {/* User Protected Routes */}
          <Route
            path="/search"
            element={
              <ProtectedRoute role="user">
                <CombinedSearchUI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute role="user">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute role="user">
                <OrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishList"
            element={
              <ProtectedRoute role="user">
                <WishList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants"
            element={
                <RestaurantListUI />
            }
          />
          <Route
            path="/food"
            element={
                <FoodDisplayUI />
            }
          />
          <Route path="/food/:id" element={<FoodDetailPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
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
