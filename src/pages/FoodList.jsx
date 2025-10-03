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
  X,
  Leaf,
  Flame,
  UtensilsCrossed,
  Share2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { AuthModal } from "../components/authModal";
import { addToCart } from "../services/cartAPI";
import { getAllFoodItems } from "../services/adminAPI";
import { Navigation } from "../components/Navigation";
import { useNavigate } from "react-router-dom";
import { addToLocalCart, isUserLoggedIn } from "../utils/cartUtils"; // ✅ Add import

export const FoodDisplayUI = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState([]); // ✅ Use consistent name
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const filteredFoods = foodItems.filter(
    (food) =>
      (food.name &&
        food.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (food.description &&
        food.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddToCart = async (foodItem) => {
    const isLoggedIn = isUserLoggedIn();

    if (!isLoggedIn) {
      const updatedCart = addToLocalCart(foodItem);
      setCartItems(updatedCart);

      toast.success(`${foodItem.name} added to cart!`);
      return;
    }

    // If logged in, add to database
    try {
      const existingItem = cartItems.find(
        (cartItem) => cartItem._id === foodItem._id
      );

      const cartData = foodItem._id;
      const response = await addToCart(cartData);

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

  const isInCart = (foodId) => {
    return cartItems.some((item) => item._id === foodId); // ✅ Use cartItems
  };

  const toggleFavorite = (foodId) => {
    if (favorites.includes(foodId)) {
      setFavorites(favorites.filter((id) => id !== foodId));
    } else {
      setFavorites([...favorites, foodId]);
    }
  };

  const openFoodDetail = (food) => {
    setSelectedFood(food);
    setShowFoodDetail(true);
  };

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

          {/* Rest of your JSX remains the same */}
          {filteredFoods.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredFoods.map((food) => (
                  <div
                    key={food._id}
                    className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative">
                      <img
                        src={
                          food.image || "https://placehold.co/600x400?text=Food"
                        }
                        alt={food.name}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-grow flex-col justify-between p-4">
                      <div>
                        <span className="text-xs font-semibold text-red-600">
                          {food.restaurantId?.restaurantsName || "Restaurant"}
                        </span>
                        <h3 className="line-clamp-1 font-bold text-lg text-gray-900">
                          {food.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Category: {food.category}
                        </p>
                        <div className="my-3 flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-800">
                            ₹{food.price}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              food.isAvailable
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {food.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                      {isInCart(food._id) ? (
                        <button
                          disabled
                          className="mt-2 w-full cursor-not-allowed rounded-lg bg-gray-200 py-2 font-medium text-gray-500"
                        >
                          Added
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(food)}
                          disabled={!food.isAvailable}
                          className="mt-2 flex w-full items-center justify-center space-x-2 rounded-lg bg-red-500 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List view code remains the same...
              <div className="space-y-4">
                {filteredFoods.map((food) => (
                  <div
                    key={food._id}
                    className="flex items-center space-x-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg"
                  >
                    <img
                      src={
                        food.image || "https://placehold.co/128x128?text=Food"
                      }
                      alt={food.name}
                      className="h-24 w-24 flex-shrink-0 rounded-xl object-cover md:h-32 md:w-32"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-red-600">
                        {food.restaurantId?.restaurantsName || "Restaurant"}
                      </span>
                      <h3 className="font-bold text-xl text-gray-900">
                        {food.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Category: {food.category}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-gray-800">
                            ₹{food.price}
                          </span>
                          <span
                            className={`mt-1 text-sm font-semibold ${
                              food.isAvailable
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {food.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        {isInCart(food._id) ? (
                          <button
                            disabled
                            className="cursor-not-allowed rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-500"
                          >
                            Added
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(food)}
                            disabled={!food.isAvailable}
                            className="flex items-center space-x-2 rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            <Plus className="h-5 w-5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Detail modal remains the same */}
      {showFoodDetail && selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
              <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
              <button
                onClick={() => setShowFoodDetail(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <img
                src={selectedFood.image}
                alt={selectedFood.name}
                className="h-64 w-full object-cover"
              />
            </div>
            <div className="p-6">
              <span className="text-sm font-semibold text-red-600">
                {selectedFood.restaurantId?.restaurantsName}
              </span>
              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                {selectedFood.name}
              </h1>
              <p className="my-4 text-gray-600">
                {selectedFood.description ||
                  "No additional description available for this item."}
              </p>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{selectedFood.price}
                </span>
                {isInCart(selectedFood._id) ? (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 text-base font-semibold text-gray-600"
                  >
                    Added to Cart
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToCart(selectedFood)}
                    disabled={!selectedFood.isAvailable}
                    className="flex items-center space-x-2 rounded-lg bg-red-500 px-6 py-3 text-base font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        open={isAuthModalOpen}
        handleClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};