import React, { useState, useEffect } from "react";
import {
  Trash2,
  ShoppingBag,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { getCartItems, removeFromCart, updateCartItem } from "../services/cartAPI";
import { placeOrder } from "../services/orderAPI";
import { Navigation } from "../components/Navigation";

const FoodCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [placingOrder, setPlacingOrder] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await getCartItems();
      setCartItems(response?.data && Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    // Optimistically update the UI for a faster user experience
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      // Call the API to update the item in the database
      await updateCartItem(itemId, { quantity: newQuantity });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity. Please try again.");
      // If the API call fails, revert the change by re-fetching data
      fetchCartData(); 
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (cartItems.length === 0) return;
      setPlacingOrder(true);
      await placeOrder({});
      alert("✅ Order placed successfully!");
      await fetchCartData(); // Refresh cart, which should now be empty
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("❌ Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const deleteCart = async (itemId) => {
    try {
      setDeletingItems((prev) => new Set(prev).add(itemId));
      await removeFromCart(itemId);
      setCartItems((items) => items.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      alert("Failed to remove item from cart. Please try again.");
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.foodId?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 50;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  return (
    <>
      <Navigation white />
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
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
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) =>
                    item.foodId && (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex gap-4">
                          <img
                            src={item.foodId.image || "https://placehold.co/120x120?text=Food"}
                            alt={item.foodId.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800">{item.foodId.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {item.foodId.restaurant?.restaurantsName || "A great restaurant"}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1">
                                <button
                                  onClick={() => item.quantity > 1 ? handleQuantityChange(item._id, item.quantity - 1) : deleteCart(item._id)}
                                  disabled={updatingItems.has(item._id) || deletingItems.has(item._id)}
                                  className="text-gray-500 hover:text-red-500 disabled:opacity-50"
                                >
                                  {item.quantity > 1 ? <Minus className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                                </button>

                                {updatingItems.has(item._id) || deletingItems.has(item._id) ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="w-5 text-center font-semibold">{item.quantity}</span>}

                                <button
                                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                  disabled={updatingItems.has(item._id) || deletingItems.has(item._id)}
                                  className="text-gray-500 hover:text-orange-500 disabled:opacity-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="font-semibold text-lg text-gray-800">
                                ₹{(item.foodId.price * item.quantity).toFixed(2)}
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Delivery fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span><span className="text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0 || loading || placingOrder}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300"
              >
                {placingOrder ? (<div className="flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin mr-2" />Placing Order...</div>) 
                : (cartItems.length === 0 ? "Cart is Empty" : "Proceed to Checkout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodCart;