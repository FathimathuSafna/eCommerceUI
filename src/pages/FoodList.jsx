import React, { useState, useEffect } from "react";
import {
  Search, Star, Clock, Heart, Plus, Grid3X3, List, ArrowLeft, Award, Eye, ShoppingCart, X, Leaf, Flame, UtensilsCrossed, Share2,
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { AuthModal } from "../components/authModal";
import { addToCart } from '../services/cartAPI';
import { getAllFoodItems } from '../services/adminAPI';

export const FoodDisplayUI = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      (food.name && food.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddToCart = async (food) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please log in to add items to your cart.");
      setIsAuthModalOpen(true);
      return;
    }
    if (isInCart(food._id)) {
        toast("This item is already in your cart.", { icon: 'ℹ️' });
        return;
    }
    try {
      await addToCart(food._id, token);
      toast.success(`${food.name} added to cart!`);
      setCart([...cart, { ...food, quantity: 1 }]);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Could not add item to cart.");
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    toast.success("Login successful!");
  };

  const isInCart = (foodId) => {
    return cart.some((item) => item._id === foodId);
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
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Menu</h1>
                <span className="text-sm text-gray-500">({filteredFoods.length} items)</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cart.length}
                    </span>
                  )}
                </button>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${viewMode === "grid" ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for your favorite dish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {filteredFoods.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFoods.map((food) => (
                  <div key={food._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="relative">
                      <img src={food.image || 'https://placehold.co/600x400?text=Food'} alt={food.name} className="w-full h-48 object-cover" />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <span className="text-xs text-red-600 font-semibold">{food.restaurantId?.restaurantsName || 'Restaurant'}</span>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{food.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">Category: {food.category}</p>
                        <div className="flex items-center justify-between my-3">
                            <span className="text-xl font-bold text-gray-800">₹{food.price}</span>
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${food.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {food.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                      </div>
                      {isInCart(food._id) ? (
                          <button disabled className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed mt-2">Added</button>
                      ) : (
                          <button onClick={() => handleAddToCart(food)} disabled={!food.isAvailable} className="w-full bg-red-500 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2">
                              <Plus className="w-5 h-5" />
                              <span>Add to Cart</span>
                          </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFoods.map((food) => (
                  <div key={food._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 flex items-center space-x-4">
                    <img src={food.image || 'https://placehold.co/128x128?text=Food'} alt={food.name} className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs text-red-600 font-semibold">{food.restaurantId?.restaurantsName || 'Restaurant'}</span>
                      <h3 className="font-bold text-xl text-gray-900">{food.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">Category: {food.category}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-800">₹{food.price}</span>
                            <span className={`mt-1 text-sm font-semibold ${food.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                {food.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                        {isInCart(food._id) ? (
                            <button disabled className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg font-medium cursor-not-allowed">Added</button>
                        ) : (
                            <button onClick={() => handleAddToCart(food)} disabled={!food.isAvailable} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <Plus className="w-5 h-5" /><span>Add</span>
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <UtensilsCrossed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900">No food items found</h3>
              <p className="text-gray-600 mt-2">Try adjusting your search to find what you're looking for.</p>
            </div>
          )}
        </main>
      </div>

      {showFoodDetail && selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
              <button onClick={() => setShowFoodDetail(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div>
                <img src={selectedFood.image} alt={selectedFood.name} className="w-full h-64 object-cover" />
            </div>
            <div className="p-6">
              <span className="text-sm text-red-600 font-semibold">{selectedFood.restaurantId?.restaurantsName}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{selectedFood.name}</h1>
              <p className="text-gray-600 my-4">{selectedFood.description || "No additional description available for this item."}</p>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold text-gray-900">₹{selectedFood.price}</span>
                {isInCart(selectedFood._id) ? (
                    <button disabled className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold text-base cursor-not-allowed">Added to Cart</button>
                ) : (
                    <button onClick={() => handleAddToCart(selectedFood)} disabled={!selectedFood.isAvailable} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-base flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <Plus className="w-5 h-5" /><span>Add to Cart</span>
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