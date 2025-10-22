import React, { useState, useEffect } from "react";
import {
  Search,
  ChefHat,
  Heart,
  PlusCircle,
  MapPin,
  Clock,
  ArrowLeft,
  Minus,
} from "lucide-react";
import { getAllRestaurantsDetails } from "../services/userApi";
import { addToCart, getCartItems, updateCartItem } from "../services/cartAPI";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import {
  addToLocalCart,
  isUserLoggedIn,
  // You may need to import updateLocalCartQuantity
} from "../utils/cartUtils";

import "react-toastify/dist/ReactToastify.css";

export const RestaurantListUI = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingToCart, setAddingToCart] = useState(null);
  // --- REMOVED MODAL STATE ---
  // const [selectedFood, setSelectedFood] = useState(null);
  // const [showModal, setShowModal] = useState(false);
  // --- END REMOVED MODAL STATE ---
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const isLoggedIn = isUserLoggedIn();

  const getCartItem = (foodId) => {
    return cartItems.find((item) => item._id === foodId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAllRestaurantsDetails();
        const foodItems = response.data;

        const groupedByRestaurant = foodItems.reduce((acc, food) => {
          const restaurantId = food.restaurantId._id;
          if (!acc[restaurantId]) {
            acc[restaurantId] = {
              ...food.restaurantId,
              foods: [],
            };
          }
          acc[restaurantId].foods.push(food);
          return acc;
        }, {});

        setRestaurants(Object.values(groupedByRestaurant));
      } catch (err) {
        setError("Failed to fetch restaurant details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load cart data to sync quantity buttons
  useEffect(() => {
    const loadCartData = async () => {
      if (isLoggedIn) {
        try {
          const response = await getCartItems();
          if (response && response.success && Array.isArray(response.data)) {
            const transformedCart = response.data.map((cartItem) => ({
              ...cartItem.foodId,
              quantity: cartItem.quantity,
              cartId: cartItem._id, // Store the cartId
            }));
            setCartItems(transformedCart);
          } else {
            setCartItems([]);
          }
        } catch (err) {
          console.error("Failed to load cart items", err);
          setCartItems([]);
        }
      }
    };
    loadCartData();
  }, [isLoggedIn]);

  // --- Handle Quantity +/- (Uses the update API) ---
  const handleUpdateQuantity = async (foodId, newQuantity) => {
    if (!isLoggedIn) {
      toast.info("Please log in to update your cart");
      return;
    }

    const cartItem = getCartItem(foodId);
    if (!cartItem || !cartItem.cartId) {
      console.error("Cannot update quantity, cartId is missing.", cartItem);
      return;
    }
    const cartId = cartItem.cartId;

    setAddingToCart(foodId); // Reuse the loading state
    const originalCart = [...cartItems];
    try {
      // Optimistic UI Update
      if (newQuantity <= 0) {
        setCartItems((prev) => prev.filter((item) => item._id !== foodId));
      } else {
        setCartItems((prev) =>
          prev.map((item) =>
            item._id === foodId ? { ...item, quantity: newQuantity } : item
          )
        );
      }

      const response = await updateCartItem(cartId, { quantity: newQuantity });

      if (
        !response ||
        (!response.success &&
          !response.msg?.includes("updated") &&
          !response.msg?.includes("removed"))
      ) {
        throw new Error(response.msg || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
      toast.error("Failed to update quantity.");
      setCartItems(originalCart); // Rollback
    } finally {
      setAddingToCart(null);
    }
  };

  const increaseQuantity = (foodId) => {
    const cartItem = getCartItem(foodId);
    if (cartItem) {
      handleUpdateQuantity(foodId, cartItem.quantity + 1);
    }
  };

  const decreaseQuantity = (foodId) => {
    const cartItem = getCartItem(foodId);
    if (cartItem) {
      handleUpdateQuantity(foodId, cartItem.quantity - 1);
    }
  };

  // --- Handle "Add to Cart" (Uses the add API) ---
  const handleAddToCart = async (foodId) => {
    const foodItem = restaurants
      .flatMap((r) => r.foods)
      .find((f) => f._id === foodId);

    if (!foodItem) {
      toast.error("Food item not found");
      return;
    }

    if (!isLoggedIn) {
      // Local cart logic
      const updatedCart = addToLocalCart(foodItem);
      setCartItems(updatedCart);
      toast.success(`${foodItem.name} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    const existingItem = getCartItem(foodId);
    if (existingItem) {
      // If item exists, use the update quantity logic
      await handleUpdateQuantity(foodId, existingItem.quantity + 1);
      return;
    }

    // If item does NOT exist, add it for the first time
    try {
      setAddingToCart(foodId);
      const response = await addToCart(foodId); // Sends foodId in URL param

      if (
        response &&
        (response.msg === "Item added to cart successfully" ||
          response.msg === "Item quantity updated in cart" || // Should be handled above
          response.msg ===
            "Item added to cart again after being ordered previously" ||
          response.status === true)
      ) {
        // Update local state to match
        setCartItems([
          ...cartItems,
          { ...foodItem, quantity: 1, cartId: response.data._id },
        ]);

        toast.success(`${foodItem.name} added to cart!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      } else {
        throw new Error(response.msg || "Failed to add item");
      }
    } catch (err) {
      toast.error("Failed to add item. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      console.error(err);
    } finally {
      setAddingToCart(null);
    }
  };

  // --- REMOVED MODAL FUNCTIONS ---
  // const openFoodModal = (food) => { ... };
  // const closeFoodModal = () => { ... };
  // --- END REMOVED FUNCTIONS ---

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.restaurantsName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      restaurant.foods?.some((food) =>
        food.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-gray-50">
        <ToastContainer />

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 gap-4">
          <button
            className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-800 font-medium mb-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>

          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {filteredRestaurants.length > 0 ? (
            <div className="space-y-4">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible hover:shadow-md transition-shadow relative"
                >
                  {/* Restaurant Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          restaurant.image ||
                          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop"
                        }
                        alt={restaurant.restaurantsName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                              {restaurant.restaurantsName}
                            </h2>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">
                              {restaurant.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">
                                  {restaurant.address?.street},{" "}
                                  {restaurant.address?.city}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>25-30 min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Menu Area */}
                  <div className="group relative">
                    <div className="px-4 pb-3 cursor-pointer">
                      <div className="flex items-center justify-between text-sm text-gray-600 group-hover:text-gray-800 transition-colors py-2">
                        <span>
                          {restaurant.foods?.length || 0} items available
                        </span>
                      </div>
                    </div>

                    {/* Hover Menu Overlay */}
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-1 group-hover:translate-y-0">
                      <div
                        className="p-3 max-h-80 overflow-y-auto scrollbar-hide"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <style jsx>{`
                          .scrollbar-hide::-webkit-scrollbar {
                            display: none;
                          }
                        `}</style>
                        <h3 className="text-base font-semibold mb-2 text-gray-900 sticky top-0 bg-white pb-1">
                          Menu Items
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
                          {restaurant.foods?.map((food) => (
                            <div
                              key={food._id}
                              className="border border-gray-200 rounded-md p-1.5 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                              // --- UPDATED CLICK HANDLER ---
                              onClick={() => navigate(`/food/${food._id}`)}
                              // --- END UPDATED HANDLER ---
                            >
                              <div className="w-full h-16 mb-1 overflow-hidden rounded-sm">
                                <img
                                  src={
                                    food.image ||
                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop"
                                  }
                                  alt={food.name}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                />
                              </div>

                              <div className="space-y-0.5">
                                <h4 className="font-medium text-xs text-gray-800 line-clamp-2 leading-tight">
                                  {food.name}
                                </h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-900">
                                    ₹{food.price}
                                  </span>
                                  <span
                                    className={`text-xs px-1 py-0.5 rounded ${
                                      food.isAvailable
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                                  >
                                    {food.isAvailable ? "✓" : "✗"}
                                  </span>
                                </div>
                              </div>

                              {/* Button logic */}
                              <div className="mt-1.5">
                                {(() => {
                                  const cartItem = getCartItem(food._id);
                                  const isInCart = !!cartItem;
                                  const isLoading = addingToCart === food._id;

                                  if (isLoading) {
                                    return (
                                      <button
                                        disabled
                                        className="w-full bg-gray-100 text-gray-400 font-medium py-0.5 px-1 rounded text-xs cursor-not-allowed"
                                      >
                                        <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                      </button>
                                    );
                                  }

                                  return !isInCart ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation(); // Keep this to prevent navigation
                                        handleAddToCart(food._id);
                                      }}
                                      disabled={!food.isAvailable}
                                      className="w-full bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 font-medium py-0.5 px-1 rounded text-xs transition-colors duration-200 disabled:cursor-not-allowed"
                                    >
                                      +
                                    </button>
                                  ) : (
                                    <div
                                      className="flex items-center justify-between space-x-1 bg-red-50 rounded"
                                      style={{ padding: "1px" }}
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Keep this
                                          decreaseQuantity(food._id);
                                        }}
                                        className="text-red-600 hover:bg-red-100 rounded-full p-0.5"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="font-medium text-xs text-gray-900 px-1">
                                        {cartItem.quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Keep this
                                          increaseQuantity(food._id);
                                        }}
                                        className="text-red-600 hover:bg-red-100 rounded-full p-0.5"
                                      >
                                        <PlusCircle className="w-3 h-3" />
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No restaurants found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse all restaurants.
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};
