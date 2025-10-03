import { useState, useEffect } from "react";
import {
  Search,
  ChefHat,
  Heart,
  PlusCircle,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { getAllRestaurantsDetails } from "../services/userApi";
import { addToCart } from "../services/cartAPI";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { addToLocalCart, isUserLoggedIn } from "../utils/cartUtils"; // ✅ Add import

import "react-toastify/dist/ReactToastify.css";

export const RestaurantListUI = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cartItems, setCartItems] = useState([]); // ✅ Add cart state
  const navigate = useNavigate();

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

  const handleAddToCart = async (foodId) => {
    const isLoggedIn = isUserLoggedIn();

    // Find the food item details
    const foodItem = restaurants
      .flatMap((r) => r.foods)
      .find((f) => f._id === foodId);

    if (!foodItem) {
      toast.error("Food item not found");
      return;
    }

    if (!isLoggedIn) {
      // Add to localStorage for guest users
      const updatedCart = addToLocalCart(foodItem);
      setCartItems(updatedCart);

      toast.success(`${foodItem.name} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });

      return;
    }

    // If logged in, add to database
    try {
      setAddingToCart(foodId);
      const response = await addToCart(foodId);

      if (
        response &&
        (response.msg === "Item added to cart successfully" ||
          response.msg === "Item quantity updated in cart")
      ) {
        const existingItem = cartItems.find((item) => item._id === foodId);

        if (existingItem) {
          setCartItems(
            cartItems.map((item) =>
              item._id === foodId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          setCartItems([...cartItems, { ...foodItem, quantity: 1 }]);
        }

        toast.success(`${foodItem.name} added to cart!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
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

  const openFoodModal = (food) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const closeFoodModal = () => {
    setSelectedFood(null);
    setShowModal(false);
  };

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
                              onClick={() => openFoodModal(food)}
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

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(food._id);
                                }}
                                disabled={
                                  !food.isAvailable ||
                                  addingToCart === food._id
                                }
                                className="w-full mt-1.5 bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 font-medium py-0.5 px-1 rounded text-xs transition-colors duration-200 disabled:cursor-not-allowed"
                              >
                                {addingToCart === food._id ? (
                                  <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                  "+"
                                )}
                              </button>
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

        {/* Food Details Modal */}
        {showModal && selectedFood && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img
                  src={
                    selectedFood.image ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop"
                  }
                  alt={selectedFood.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <button
                  onClick={closeFoodModal}
                  className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedFood.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedFood.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedFood.isAvailable ? "Available" : "Not Available"}
                  </span>
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-4">
                  ₹{selectedFood.price}
                </div>

                {selectedFood.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedFood.description}
                    </p>
                  </div>
                )}

                {selectedFood.category && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </h3>
                    <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {selectedFood.category}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={closeFoodModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(selectedFood._id);
                    }}
                    disabled={
                      !selectedFood.isAvailable ||
                      addingToCart === selectedFood._id
                    }
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {addingToCart === selectedFood._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}