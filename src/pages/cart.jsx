import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { getCartItems, removeFromCart } from "../services/cartAPI"; // Assuming this is your API function
import { Navigation } from "../components/Navigation"; // Assuming you have this component

const FoodCart = () => {
  // State to hold cart items fetched from the API
  const [cartItems, setCartItems] = useState([]);
  // State to manage the loading status
  const [loading, setLoading] = useState(true);
  // State to manage delete loading for individual items
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Fetch cart items when the component mounts
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const response = await getCartItems();
        if (response && Array.isArray(response.data)) {
          setCartItems(response.data);
        } else {
          setCartItems([]); // Set to empty array if data is not as expected
        }
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
        setCartItems([]); // Set to empty on error to prevent crashes
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []); // Empty dependency array ensures this runs only once on mount

  const updateQuantity = (id, newQuantity) => {
    // This function will need to be connected to a backend API call in a real app
    if (newQuantity === 0) {
      deleteCart(id);
    } else {
      setCartItems((items) =>
        items.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Delete cart item function with API call
  const deleteCart = async (itemId) => {
    try {
      // Add item to deleting state to show loading
      setDeletingItems((prev) => new Set([...prev, itemId]));

      // Call the API to remove item from cart
      await removeFromCart(itemId);

      // Remove item from local state after successful API call
      setCartItems((items) => items.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      // You might want to show an error message to the user here
      alert("Failed to remove item from cart. Please try again.");
    } finally {
      // Remove item from deleting state
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Legacy removeItem function (kept for backward compatibility)
  const removeItem = (id) => {
    deleteCart(id);
  };

  // --- Calculations ---
  // Note: The API response you shared had totalPrice as 0.
  // The calculation below assumes we use the price from the populated foodId.
  const subtotal = cartItems.reduce((sum, item) => {
    // Check if foodId and its price exist before calculating
    const price = item.foodId ? item.foodId.price : 0;
    return sum + price * item.quantity;
  }, 0);

  const discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const deliveryFee = 50; // Example delivery fee in your currency
  const tax = (subtotal - discount) * 0.05; // Example 5% tax
  const total = subtotal - discount + deliveryFee + tax;

  return (
    <>
      <Navigation white />
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm font-medium">
                  {cartItems.length} items
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                  <p className="text-gray-500">Loading your cart...</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(
                    (item) =>
                      // Ensure foodId exists before trying to render the item
                      item.foodId && (
                        <div
                          key={item._id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-orange-200 transition-colors"
                        >
                          <div className="flex gap-4">
                            <img
                              src={
                                item.foodId.image ||
                                "https://placehold.co/120x120?text=Food"
                              }
                              alt={item.foodId.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {item.foodId.name}
                                  </h3>
                                  {/* You may need to populate the restaurant info as well */}
                                  <p className="text-sm text-gray-500">
                                    {item.foodId.restaurant?.restaurantsName ||
                                      "A great restaurant"}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteCart(item._id)}
                                  disabled={deletingItems.has(item._id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  title="Remove item from cart"
                                >
                                  {deletingItems.has(item._id) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  {/* <div className="flex items-center border rounded-lg">
                                    {/* <button
                                      onClick={() =>
                                        updateQuantity(
                                          item._id,
                                          item.quantity - 1
                                        )
                                      }
                                      className="p-1 hover:bg-gray-100 transition-colors"
                                      disabled={deletingItems.has(item._id)}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button> */}
                                    {/* <span className="px-3 py-1 min-w-[40px] text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item._id,
                                          item.quantity + 1
                                        )
                                      }
                                      className="p-1 hover:bg-gray-100 transition-colors"
                                      disabled={deletingItems.has(item._id)}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button> */}
                                  {/* </div>  */}
                                </div>
                                <p className="font-semibold text-gray-800">
                                  ₹
                                  {(item.foodId.price * item.quantity).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                disabled={cartItems.length === 0 || loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Loading..."
                  : cartItems.length === 0
                  ? "Cart is Empty"
                  : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodCart;
