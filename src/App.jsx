import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import Cart from "./components/Cart";
import WishList from "./components/wishList";
import { OrderPage } from "./components/orders";
import { RestaurantListUI } from "./components/restaurantList";
import { FoodDisplayUI } from "./components/FoodList";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard to="/" />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/wishList" element={<WishList />} />
          <Route path="/restaurants" element={<RestaurantListUI />} />
          <Route path="/food" element={<FoodDisplayUI />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
