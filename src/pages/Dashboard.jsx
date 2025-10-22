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
import { addToCart, updateCartItem, getCartItems } from "../services/cartAPI";
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
  const [likedItems, setLikedItems] = useState([]);
  const navigate = useNavigate();
  const isLoggedIn = isUserLoggedIn();

  // Helper function to get cart item
  const getCartItem = (foodId) => {
    return cartItems.find((item) => item._id === foodId);
  };

  useEffect(() => {
    const loadLikes = async () => {
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
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        setLoading(true);
        const response = await getAllFoodItems();
        const limitedItems = Array.isArray(response.data)
          ? response.data.slice(0, 6)
          : [];
        setFoodItems(limitedItems);
      } catch (error) {
        console.error("Failed to fetch food items:", error);
        setFoodItems([]);
        toast.error("Failed to load food items. Please refresh the page.", {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFoodData();
  }, []);

  useEffect(() => {
    const loadCartData = async () => {
      if (isLoggedIn) {
        try {
          const response = await getCartItems();
          console.log("Cart items response:", response);

          if (response && response.success && Array.isArray(response.data)) {
            const transformedCart = response.data.map((cartItem) => ({
              ...cartItem.foodId,
              quantity: cartItem.quantity,
              cartId: cartItem._id
            }));
            setCartItems(transformedCart);
          } else {
            console.warn(
              "Failed to get cart data or cart is empty:",
              response?.msg
            );
            setCartItems([]);
          }
        } catch (err) {
          console.error("Failed to load cart items", err);
          toast.error("Could not load your cart. Please try again.");
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    };

    loadCartData();
  }, [isLoggedIn]);

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

  // Navigate to food detail page
  const handleFoodClick = (foodId) => {
    navigate(`/food/${foodId}`);
  };

  const handleAddToCart = async (foodItem, event) => {
    // Prevent navigation when clicking the button
    event.stopPropagation();
    
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

    try {
      const existingItem = cartItems.find(
        (cartItem) => cartItem._id === foodItem._id
      );

      if (existingItem) {
        await handleUpdateQuantity(foodItem._id, existingItem.quantity + 1);
      } else {
        const cartData = foodItem._id;
        const response = await addToCart(cartData);
        console.log("Add to Cart response:", response);

        if (
          response &&
          (response.msg === "Item added to cart successfully" ||
            response.status === true ||
            response.success === true)
        ) {
          setCartItems([...cartItems, { ...foodItem, quantity: 1 }]);
          toast.success(`${foodItem.name} added to cart!`, {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
          });
        } else {
          throw new Error(response?.msg || "Failed to add to cart");
        }
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

  const toggleFavorite = async (foodId, event) => {
    // Prevent navigation when clicking the heart button
    event.stopPropagation();
    
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
      if (isCurrentlyLiked) {
        setLikedItems((prev) => [...prev, foodId]);
      } else {
        setLikedItems((prev) => prev.filter((id) => id !== foodId));
      }
    }
  };

  const handleUpdateQuantity = async (foodId, newQuantity) => {
    const isLoggedIn = isUserLoggedIn();
    const cartItem = getCartItem(foodId);

    if (!isLoggedIn) {
      return;
    }

    if (!cartItem || !cartItem.cartId) {
      console.error("Cannot update quantity, cartId is missing.", cartItem);
      return;
    }
    const cartId = cartItem.cartId;

    const originalCart = [...cartItems]; 
    try {
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
      console.log("Update cart response:", response);

      if (response && (response.success || response.msg?.includes("updated"))) {
        // Success
      } else {
        throw new Error(response.msg || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
      toast.error("Failed to update quantity. Please try again!", {
        position: "top-right",
        autoClose: 3000,
      });
      setCartItems(originalCart);
    }
  };

  const increaseQuantity = (foodId, event) => {
    event.stopPropagation();
    const cartItem = getCartItem(foodId);
    if (cartItem) {
      handleUpdateQuantity(foodId, cartItem.quantity + 1);
    }
  };

  const decreaseQuantity = (foodId, event) => {
    event.stopPropagation();
    const cartItem = getCartItem(foodId);
    if (cartItem) {
      handleUpdateQuantity(foodId, cartItem.quantity - 1);
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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category !== "All") {
      toast.dismiss();
      toast.info(`Showing ${category} items`, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };

  const handleCartToggle = () => {
    setShowCart(!showCart);
    if (!showCart && cartItemCount > 0) {
      toast.info(
        `Your cart has ${cartItemCount} item${cartItemCount > 1 ? "s" : ""}`,
        {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: true,
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
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center">
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

              <div className="relative">
                <div className="relative z-10">
                  <div className="flex items-center justify-center text-center text-white min-h-[35vh] sm:min-h-[50vh] md:min-h-[73vh]">
                    <img
                      src="/burgers.png"
                      className="w-full h-full object-contain sm:object-cover"
                      alt="Delicious burgers"
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
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-red-200 cursor-pointer"
                  onClick={() => handleFoodClick(foodItem._id)}
                >
                  <div className="relative">
                    <img
                      src={
                        foodItem.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=180&fit=crop"
                      }
                      alt={foodItem.name}
                      className="w-full h-36 object-cover hover:opacity-95 transition-opacity"
                    />
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      {foodItem.discount && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold shadow-sm">
                          {foodItem.discount}% OFF
                        </span>
                      )}
                      {isLoggedIn && (
                        <button
                          onClick={(e) => toggleFavorite(foodItem._id, e)}
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
                      )}
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

                      {(() => {
                        const cartItem = getCartItem(foodItem._id);
                        const isInCart = !!cartItem;

                        return !isInCart ? (
                          <button
                            onClick={(e) => handleAddToCart(foodItem, e)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 text-sm"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 bg-red-500 rounded-md px-2 py-1">
                            <button
                              onClick={(e) => decreaseQuantity(foodItem._id, e)}
                              className="text-white hover:bg-red-600 rounded p-1 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white font-semibold text-sm min-w-[20px] text-center">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={(e) => increaseQuantity(foodItem._id, e)}
                              className="text-white hover:bg-red-600 rounded p-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Show More Button */}
          {foodItems.length > 0 && (
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
      </div>
      <Footer />
    </>
  );
};