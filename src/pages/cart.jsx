import React, { useState, useEffect } from "react";
import { Trash2, ShoppingBag, Loader2, Plus, Minus } from "lucide-react";
import {
  getCartItems,
  removeFromCart,
  updateCartItem,
} from "../services/cartAPI";
import { placeOrder, verifyPayment } from "../services/orderAPI";
import { getMyProfile } from "../services/userApi";
import { Navigation } from "../components/Navigation";
import AddressSelectionModal from "../components/addressModal";
import {
  getLocalCart,
  updateLocalCartQuantity,
  removeFromLocalCart,
  isUserLoggedIn,
} from "../utils/cartUtils";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const FoodCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [placingOrder, setPlacingOrder] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [orderAmount, setOrderAmount] = useState(0);
  const isLoggedIn = isUserLoggedIn();
  const navigate = useNavigate();

  const fetchCartData = async () => {
    try {
      setLoading(true);

      if (!isLoggedIn) {
        const localCart = getLocalCart();
        setCartItems(localCart);
      } else {
        const response = await getCartItems();
        setCartItems(
          response?.data && Array.isArray(response.data) ? response.data : []
        );
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await getMyProfile();
      setUserProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    fetchCartData();
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    if (!isLoggedIn) {
      updateLocalCartQuantity(itemId, newQuantity);
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, { quantity: newQuantity });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
      fetchCartData();
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleCheckout = (amount) => {
    if (!isLoggedIn) {
      toast.info("Please login to place an order!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Store the amount and show address modal
    setOrderAmount(amount);
    setShowAddressModal(true);
  };

  const handleAddressConfirm = async (addressData) => {
    setShowAddressModal(false);

    try {
      setPlacingOrder(true);
      const fullAddress = `${addressData.address}, ${addressData.pincode}`;
      const orderResponse = await placeOrder({
        amount: orderAmount,
        address: fullAddress,
      });
      if (!orderResponse.success || !orderResponse.razorpayOrder?.id) {
        toast.error("Failed to create order");
        setPlacingOrder(false);
        return;
      }

      const { razorpayOrder } = orderResponse;
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load");
        setPlacingOrder(false);
        return;
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Your Store",
        description: "Order Payment",
        order_id: razorpayOrder.id,

        handler: async (response) => {
          try {
            // Verify payment with backend
            const verificationData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderAmount,
              address: fullAddress,
            });

            if (verificationData.success) {
              toast.success(" Order placed successfully!");
              fetchCartData();
              navigate("/orders");
            } else {
              toast.error(
                verificationData.msg || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed");
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: async () => {
            console.log("Payment dismissed/failed");

            try {
              await handlePaymentFailure({
                razorpay_order_id: razorpayOrder.id,
                error: "Payment cancelled by user",
              });
            } catch (error) {
              console.error("Failed to update payment status:", error);
            }

            setPlacingOrder(false);
            toast.error("❌ Payment cancelled");
          },
        },

        prefill: {
          name: userProfile?.fullName || "",
          email: userProfile?.email || "",
          contact: userProfile?.phoneNumber || "",
        },
        theme: { color: "#f97316" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async (response) => {
        console.log("Payment failed:", response.error);

        try {
          await handlePaymentFailure({
            razorpay_order_id: razorpayOrder.id,
            error: response.error.description,
          });
          toast.error(` Payment failed: ${response.error.description}`);
        } catch (error) {
          console.error("Failed to update payment status:", error);
        }

        setPlacingOrder(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Could not initiate payment");
      setPlacingOrder(false);
    }
  };

  // Helper to load SDK
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const deleteCart = async (itemId) => {
    try {
      setDeletingItems((prev) => new Set(prev).add(itemId));

      if (!isLoggedIn) {
        const updatedCart = removeFromLocalCart(itemId);
        setCartItems(updatedCart);
        toast.success("Item removed from cart");
      } else {
        await removeFromCart(itemId);
        setCartItems((items) => items.filter((item) => item._id !== itemId));
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast.error("Failed to remove item from cart. Please try again.");
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
    const price = item.foodId?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 0;
  const tax = subtotal * 0;
  const total = subtotal;
  // + deliveryFee + tax;

  return (
    <>
      <Navigation white />
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onConfirm={handleAddressConfirm}
        userProfile={userProfile}
      />
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
                  {cartItems.map((item) => {
                    const foodData = item.foodId || item;
                    const imageUrl =
                      foodData.image ||
                      "https://placehold.co/120x120?text=Food";
                    const foodName = foodData.name || "Food Item";
                    const foodPrice = foodData.price || 0;
                    const restaurantName =
                      foodData.restaurant?.restaurantsName ||
                      foodData.restaurantId?.restaurantsName ||
                      "Restaurant";

                    return (
                      <div
                        key={item._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex gap-4">
                          <img
                            src={imageUrl}
                            alt={foodName}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {foodName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {restaurantName}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1">
                                <button
                                  onClick={() =>
                                    item.quantity > 1
                                      ? handleQuantityChange(
                                          item._id,
                                          item.quantity - 1
                                        )
                                      : deleteCart(item._id)
                                  }
                                  disabled={
                                    updatingItems.has(item._id) ||
                                    deletingItems.has(item._id)
                                  }
                                  className="text-gray-500 hover:text-red-500 disabled:opacity-50"
                                >
                                  {item.quantity > 1 ? (
                                    <Minus className="w-4 h-4" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  )}
                                </button>

                                {updatingItems.has(item._id) ||
                                deletingItems.has(item._id) ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <span className="w-5 text-center font-semibold">
                                    {item.quantity}
                                  </span>
                                )}

                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item._id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={
                                    updatingItems.has(item._id) ||
                                    deletingItems.has(item._id)
                                  }
                                  className="text-gray-500 hover:text-orange-500 disabled:opacity-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="font-semibold text-lg text-gray-800">
                                ₹{(foodPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-sm">
                  <span>Delivery fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div> */}
                {/* <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div> */}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCheckout(total)}
                disabled={cartItems.length === 0 || loading || placingOrder}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300"
              >
                {placingOrder ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Placing Order...
                  </div>
                ) : cartItems.length === 0 ? (
                  "Cart is Empty"
                ) : !isLoggedIn ? (
                  "Login to Checkout"
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodCart;
