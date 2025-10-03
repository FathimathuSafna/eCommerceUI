import { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Clock,
  Heart,
  Filter,
  X,
  Plus,
  Minus,
  ArrowRight,
  ShoppingCart,
  User,
  Search,
  Bell,
  Loader2,
  Phone,
} from "lucide-react";
import Footer from "./footer";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { getAllFoodItems } from "../services/adminAPI";
import { addToCart } from "../services/cartAPI";
import { likeFood, removeLike, fetchLikes } from "../services/likeAPI";
import { toast, ToastContainer } from "react-toastify";
import { addToLocalCart, isUserLoggedIn } from "../utils/cartUtils";
import "react-toastify/dist/ReactToastify.css";

export const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [likedItems, setLikedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLikes = async () => {
      // ✅ Only fetch if logged in
      if (!isUserLoggedIn()) return;

      try {
        const likes = await fetchLikes();
        const likedFoodIds = likes
          .filter((like) => like.foodId)
          .map((like) => like.foodId._id);
        setLikedItems(likedFoodIds);
      } catch (err) {
        console.error("Failed to load likes", err);
      }
    };
    loadLikes();
  }, []);

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        setLoading(true);
        const response = await getAllFoodItems();
        // Limit to 6 items for dashboard display
        const limitedItems = Array.isArray(response.data)
          ? response.data.slice(0, 6)
          : [];
        setFoodItems(limitedItems);

        // Success toast for data loading
        // if (limitedItems.length > 0) {
        //   toast.success(`Loaded ${limitedItems.length} delicious food items!`, {
        //     position: "top-right",
        //     autoClose: 3000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //   });
        // }
      } catch (error) {
        console.error("Failed to fetch food items:", error);
        setFoodItems([]);

        // Error toast for failed loading
        toast.error("Failed to load food items. Please refresh the page.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFoodData();
  }, []);

  // Extract unique categories from food items
  const getCategories = () => {
    const categories = ["All"];
    const uniqueCategories = [
      ...new Set(foodItems.map((item) => item.category)),
    ].filter(Boolean);
    return [...categories, ...uniqueCategories];
  };

  const categories = getCategories();

  // Filter food items based on search and category
  const filteredFoodItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.restaurantId?.restaurantsName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const openFoodModal = (foodItem) => {
    setSelectedFood(foodItem);
    setShowModal(true);

    // Info toast when viewing item details

    toast.info(`Viewing details for ${foodItem.name}`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFood(null);
  };

  const handleAddToCart = async (foodItem) => {
    const isLoggedIn = isUserLoggedIn();

    if (!isLoggedIn) {
      const updatedCart = addToLocalCart(foodItem);
      setCartItems(updatedCart);

      toast.success(`${foodItem.name} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    // If logged in, add to database
    try {
      const existingItem = cartItems.find(
        (cartItem) => cartItem._id === foodItem._id
      );

      const cartData = foodItem._id;
      const response = await addToCart(cartData);
      console.log("Cart response:", response);

      // ✅ Accept both success messages
      if (
        response &&
        (response.msg === "Item added to cart successfully" ||
          response.msg === "Item quantity updated in cart")
      ) {
        if (existingItem) {
          setCartItems(
            cartItems.map((cartItem) =>
              cartItem._id === foodItem._id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          );
        } else {
          setCartItems([...cartItems, { ...foodItem, quantity: 1 }]);
        }

        toast.success(`${foodItem.name} added to cart!`, {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });
      } else {
        throw new Error(response?.msg || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error(`Failed to add ${foodItem.name} to cart. Please try again!`, {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cartItems.find((cartItem) => cartItem._id === itemId);

    if (existingItem && existingItem.quantity === 1) {
      setCartItems(cartItems.filter((cartItem) => cartItem._id !== itemId));

      // Toast for item removal
      toast.warn(`${existingItem.name} removed from cart`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem._id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );

      // Toast for quantity decrease
      toast.info(`Decreased ${existingItem.name} quantity`, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };

  const toggleFavorite = async (foodId) => {
    // ✅ Check if user is logged in first
    const isLoggedIn = isUserLoggedIn();

    if (!isLoggedIn) {
      toast.info("Please login to add favorites!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const foodItem = foodItems.find((item) => item._id === foodId);
    const isCurrentlyLiked = likedItems.includes(foodId);

    // Optimistically update UI
    if (isCurrentlyLiked) {
      setLikedItems((prev) => prev.filter((id) => id !== foodId));
    } else {
      setLikedItems((prev) => [...prev, foodId]);
    }

    try {
      if (isCurrentlyLiked) {
        await removeLike(foodItem._id);
        toast.warn(`Removed ${foodItem?.name} from favorites`, {
          position: "bottom-left",
        });
      } else {
        await likeFood({ foodId });
        toast.success(`Added ${foodItem?.name} to favorites!`, {
          position: "bottom-left",
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Failed to update favorite status:", error);
      toast.error("Could not update favorites. Please try again.");

      // Revert if API fails
      if (isCurrentlyLiked) {
        setLikedItems((prev) => [...prev, foodId]);
      } else {
        setLikedItems((prev) => prev.filter((id) => id !== foodId));
      }
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Category change toast
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    if (category !== "All") {
      toast.dismiss();
      toast.info(`Showing ${category} items`, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };

  // Cart view toggle
  const handleCartToggle = () => {
    setShowCart(!showCart);

    if (!showCart && cartItemCount > 0) {
      toast.info(
        `Your cart has ${cartItemCount} item${cartItemCount > 1 ? "s" : ""}`,
        {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading delicious food...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      {/* Enhanced ToastContainer with custom styling */}
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
        toastStyle={{
          borderRadius: "10px",
          fontSize: "14px",
        }}
        progressStyle={{
          background: "linear-gradient(90deg, #ef4444, #f97316)",
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center">
              {/* Left side content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-4">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  Free delivery on first order
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-3 sm:mb-6 leading-snug sm:leading-tight">
                  Craving
                  <span className="relative inline-block mx-1 sm:mx-2">
                    <span className="text-red-500">Food?</span>
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-2 sm:h-3"
                      viewBox="0 0 200 12"
                      fill="none"
                    >
                      <path
                        d="M2 8C60 2 140 2 198 8"
                        stroke="#EF4444"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <br />
                  We've got you!
                </h1>

                <p className="text-sm sm:text-base md:text-xl text-gray-700 mb-3 sm:mb-6 max-w-xs sm:max-w-md lg:max-w-lg mx-auto lg:mx-0">
                  Order from your favorite local restaurants and get it
                  delivered fresh to your doorstep in minutes.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center lg:justify-start mb-4 sm:mb-6">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => {
                      navigate("/restaurants");
                      toast.success("Let's find you something delicious! 🍽️", {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: true,
                      });
                    }}
                  >
                    Order Now
                  </button>
                </div>
              </div>

              {/* Right side image */}
              <div className="relative">
                <div className="relative z-10">
                  <div className="flex items-center justify-center text-center text-white min-h-[35vh] sm:min-h-[50vh] md:min-h-[73vh]">
                    <img
                      src="/burgers.png"
                      className="w-full h-full object-contain sm:object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 py-4 bg-white border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-6 py-3 rounded-full whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-red-500 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 hover:shadow-md"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">
              {filteredFoodItems.length} items available
            </h2>
          </div>

          {/* Food Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFoodItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ShoppingCart className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No food items found</p>
                <p className="text-gray-400">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              filteredFoodItems.map((foodItem) => (
                <div
                  key={foodItem._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-red-200"
                >
                  <div className="relative">
                    <img
                      src={
                        foodItem.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=180&fit=crop"
                      }
                      alt={foodItem.name}
                      className="w-full h-36 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openFoodModal(foodItem)}
                    />
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      {foodItem.discount && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold shadow-sm">
                          {foodItem.discount}% OFF
                        </span>
                      )}
                      <button
                        onClick={() => toggleFavorite(foodItem._id)}
                        className="p-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            likedItems.includes(foodItem._id)
                              ? "text-red-500 fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-base text-gray-800 truncate">
                        {foodItem.name}
                      </h3>
                      <span className="text-base font-bold text-green-600 ml-2 flex-shrink-0">
                        ₹{foodItem.price}
                      </span>
                    </div>

                    <p className="text-gray-600 text-xs mb-2 truncate">
                      {foodItem.restaurantId?.restaurantsName || "Restaurant"}
                    </p>

                    {foodItem.category && (
                      <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full inline-block mb-3">
                        {foodItem.category}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs">
                        {foodItem.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-green-500 fill-current" />
                            <span className="font-medium">
                              {foodItem.rating}
                            </span>
                          </div>
                        )}
                        {foodItem.preparationTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              {foodItem.preparationTime}m
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(foodItem)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Show More Button */}
          {foodItems.length && (
            <div className="flex justify-center mt-14 mb-6">
              <button
                className="flex items-center text-sm font-medium bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                onClick={() => {
                  navigate("/food");
                  toast.success("Loading all food items for you! 🍕🍔🍜", {
                    position: "top-center",
                    autoClose: 2000,
                  });
                }}
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Food Item Modal */}
        {showModal && selectedFood && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedFood.name}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-4">
                  <img
                    src={
                      selectedFood.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                    }
                    alt={selectedFood.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{selectedFood.price}
                    </span>
                    {selectedFood.category && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        {selectedFood.category}
                      </span>
                    )}
                  </div>

                  {selectedFood.restaurantId?.restaurantsName && (
                    <p className="text-gray-600">
                      <strong>Restaurant:</strong>{" "}
                      {selectedFood.restaurantId.restaurantsName}
                    </p>
                  )}

                  {selectedFood.description && (
                    <p className="text-gray-700">{selectedFood.description}</p>
                  )}

                  {selectedFood.preparationTime && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Ready in {selectedFood.preparationTime} minutes
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleAddToCart(selectedFood);
                      closeModal();
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        {/* {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Your Order</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                      >
                        <img
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop"
                          }
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-green-600 font-semibold">
                            ₹{item.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{getTotalPrice()}
                    </span>
                  </div>
                  <button
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
                    onClick={() => {
                      navigate("/cart");
                      toast.success(
                        `Proceeding to checkout with ${cartItemCount} items! 🛒`,
                        {
                          position: "top-center",
                          autoClose: 2000,
                        }
                      );
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* Floating Cart Button */}
        {/* {cartItemCount > 0 && (
          <button
            onClick={handleCartToggle}
            className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
          </button>
        )} */}
      </div>
      <Footer />
    </>
  );
};
