import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  Clock,
  Heart,
  Plus,
  Grid3X3,
  List,
  ArrowLeft,
  Award,
  Eye,
  ShoppingCart,
  X, // No longer needed
  Leaf,
  Flame,
  UtensilsCrossed,
  Share2,
  Minus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { AuthModal } from "../components/authModal";
import {
  addToCart,
  getCartItems,
  updateCartItem,
} from "../services/cartAPI";
import { getAllFoodItems } from "../services/adminAPI";
import { Navigation } from "../components/Navigation";
import { useNavigate } from "react-router-dom";
import { addToLocalCart, isUserLoggedIn } from "../utils/cartUtils";

export const FoodDisplayUI = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  // --- REMOVED MODAL STATE ---
  // const [selectedFood, setSelectedFood] = useState(null);
  // const [showFoodDetail, setShowFoodDetail] = useState(false);
  // --- END REMOVED MODAL STATE ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const navigate = useNavigate();
  const isLoggedIn = isUserLoggedIn();

  const getCartItem = (foodId) => {
    return cartItems.find((item) => item._id === foodId);
  };

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const response = await getAllFoodItems();
        setFoodItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch food items:", error);
        setFoodItems([]);
        toast.error("Could not fetch food items.");
      }
    };
    fetchFoodData();
  }, []);

  useEffect(() => {
    const loadCartData = async () => {
      if (isLoggedIn) {
        try {
          setLoadingCart(true);
          const response = await getCartItems();
          if (response && response.success && Array.isArray(response.data)) {
            const transformedCart = response.data.map((cartItem) => ({
              ...cartItem.foodId,
              quantity: cartItem.quantity,
              cartId: cartItem._id,
            }));
            setCartItems(transformedCart);
          } else {
            setCartItems([]);
          }
        } catch (err) {
          console.error("Failed to load cart items", err);
          setCartItems([]);
        } finally {
          setLoadingCart(false);
        }
      } else {
        setLoadingCart(false);
      }
    };
    loadCartData();
  }, [isLoggedIn]);

  const filteredFoods = foodItems.filter(
    (food) =>
      (food.name &&
        food.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (food.description &&
        food.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      setCartItems(originalCart);
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

  const handleAddToCart = async (foodItem) => {
    if (!isLoggedIn) {
      const updatedCart = addToLocalCart(foodItem);
      setCartItems(updatedCart);
      toast.success(`${foodItem.name} added to cart!`);
      return;
    }

    const existingItem = getCartItem(foodItem._id);

    if (existingItem) {
      await handleUpdateQuantity(foodItem._id, existingItem.quantity + 1);
      return;
    }

    try {
      const cartData = foodItem._id;
      const response = await addToCart(cartData);

      if (
        response &&
        (response.msg === "Item added to cart successfully" ||
          response.msg === "Item quantity updated in cart" ||
          response.status === true ||
          response.success === true)
      ) {
        setCartItems([
          ...cartItems,
          { ...foodItem, quantity: 1, cartId: response.data?._id },
        ]);

        toast.success(`${foodItem.name} added to cart!`);
      } else {
        throw new Error(response?.msg || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error(`Failed to add ${foodItem.name} to cart. Please try again!`);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    toast.success("Login successful!");
  };

  const toggleFavorite = (foodId) => {
    if (favorites.includes(foodId)) {
      setFavorites(favorites.filter((id) => id !== foodId));
    } else {
      setFavorites([...favorites, foodId]);
    }
  };

  // --- REMOVED openFoodDetail FUNCTION ---
  // const openFoodDetail = (food) => { ... };
  // --- END REMOVED FUNCTION ---

  return (
    <>
      <Navigation />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            className="mb-4 flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1 font-medium text-gray-800 transition-colors hover:bg-gray-200 sm:px-4 sm:py-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Back
          </button>

          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for your favorite dish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filteredFoods.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredFoods.map((food) => {
                  const cartItem = getCartItem(food._id);

                  return (
                    <div
                      key={food._id}
                      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                    >
                      <div className="relative">
                        <img
                          src={
                            food.image || "https://placehold.co/400x300?text=Food"
                          }
                          alt={food.name}
                          className="h-32 sm:h-36 w-full object-cover cursor-pointer"
                          // --- UPDATED CLICK HANDLER ---
                          onClick={() => navigate(`/food/${food._id}`)}
                          // --- END UPDATED HANDLER ---
                        />
                      </div>
                      <div className="flex flex-grow flex-col justify-between p-2 sm:p-3">
                        <div>
                          <span className="text-xs font-semibold text-red-600 line-clamp-1">
                            {food.restaurantId?.restaurantsName || "Restaurant"}
                          </span>
                          <h3
                            className="line-clamp-1 font-semibold text-sm sm:text-base text-gray-900 cursor-pointer"
                            // --- UPDATED CLICK HANDLER ---
                            onClick={() => navigate(`/food/${food._id}`)}
                            // --- END UPDATED HANDLER ---
                          >
                            {food.name}
                          </h3>
                          <div className="my-2 flex items-center justify-between">
                            <span className="text-base sm:text-lg font-bold text-gray-800">
                              ₹{food.price}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                                food.isAvailable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {food.isAvailable ? "Available" : "Out"}
                            </span>
                          </div>
                        </div>

                        {/* Button logic remains the same */}
                        <div className="mt-2">
                          {cartItem ? (
                            <div className="flex items-center justify-center space-x-2 rounded-md bg-red-500 py-1.5 font-medium">
                              <button
                                onClick={() => decreaseQuantity(food._id)}
                                className="text-white transition-opacity hover:opacity-75"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="font-bold text-sm text-white min-w-[20px] text-center">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(food._id)}
                                className="text-white transition-opacity hover:opacity-75"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(food)}
                              disabled={!food.isAvailable}
                              className="flex w-full items-center justify-center space-x-1 rounded-md bg-red-500 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFoods.map((food) => {
                  const cartItem = getCartItem(food._id);

                  return (
                    <div
                      key={food._id}
                      className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md"
                    >
                      <img
                        src={
                          food.image || "https://placehold.co/96x96?text=Food"
                        }
                        alt={food.name}
                        className="h-20 w-20 flex-shrink-0 rounded-lg object-cover cursor-pointer"
                        // --- UPDATED CLICK HANDLER ---
                        onClick={() => navigate(`/food/${food._id}`)}
                        // --- END UPDATED HANDLER ---
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-red-600">
                          {food.restaurantId?.restaurantsName || "Restaurant"}
                        </span>
                        <h3
                          className="font-semibold text-base text-gray-900 cursor-pointer truncate"
                          // --- UPDATED CLICK HANDLER ---
                          onClick={() => navigate(`/food/${food._id}`)}
                          // --- END UPDATED HANDLER ---
                        >
                          {food.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-800">
                            ₹{food.price}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              food.isAvailable
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {food.isAvailable ? "Available" : "Out of stock"}
                          </span>
                        </div>
                      </div>

                      {/* Button logic remains the same */}
                      <div className="flex-shrink-0">
                        {cartItem ? (
                          <div className="flex items-center justify-center space-x-2 rounded-md bg-red-500 px-3 py-1.5 font-medium">
                            <button
                              onClick={() => decreaseQuantity(food._id)}
                              className="text-white transition-opacity hover:opacity-75"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-bold text-sm text-white min-w-[20px] text-center">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(food._id)}
                              className="text-white transition-opacity hover:opacity-75"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(food)}
                            disabled={!food.isAvailable}
                            className="flex items-center space-x-1 rounded-md bg-red-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="py-16 text-center">
              <UtensilsCrossed className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="text-2xl font-semibold text-gray-900">
                No food items found
              </h3>
              <p className="mt-2 text-gray-600">
                Try adjusting your search to find what you're looking for.
              </p>
            </div>
          )}
        </main>
      </div>
      <AuthModal
        open={isAuthModalOpen}
        handleClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};