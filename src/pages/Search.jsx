// src/components/CombinedSearch.jsx

import { useState, useEffect, useMemo } from "react";
import { Search, Store, UtensilsCrossed, Star } from "lucide-react";

// --- Sample Data (You would fetch this from an API) ---
const restaurantsData = [
  {
    id: 1,
    name: "Mario's Pizzeria",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    cuisine: "Pizza, Italian",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Burger Junction",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    cuisine: "Burgers, Fast Food",
    rating: 4.2,
  },
  {
    id: 3,
    name: "Spice Garden",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop",
    cuisine: "North Indian, Biryani",
    rating: 4.7,
  },
];

const menuItemsData = [
  {
    id: 101,
    restaurantId: 1,
    name: "Margherita Pizza",
    price: 299,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop",
  },
  {
    id: 102,
    restaurantId: 1,
    name: "Pepperoni Pizza",
    price: 399,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop",
  },
  {
    id: 201,
    restaurantId: 2,
    name: "Classic Cheeseburger",
    price: 199,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
  },
  {
    id: 301,
    restaurantId: 3,
    name: "Chicken Biryani",
    price: 249,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=200&h=200&fit=crop",
  },
  {
    id: 302,
    restaurantId: 3,
    name: "Paneer Tikka Pizza", // Added a pizza to a non-pizza place for search demo
    price: 279,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=200&h=200&fit=crop",
  }
];
// --- End Sample Data ---


export const CombinedSearchUI = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  // Simulate fetching data on component mount
  useEffect(() => {
    setRestaurants(restaurantsData);
    setMenuItems(menuItemsData);
  }, []);
  
  // Memoize the filtering logic to avoid re-calculating on every render
  const filteredResults = useMemo(() => {
    if (!searchTerm) {
      return [];
    }

    const lowercasedTerm = searchTerm.toLowerCase();

    // Filter restaurants
    const filteredRestaurants = restaurants
      .filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(lowercasedTerm) ||
          restaurant.cuisine.toLowerCase().includes(lowercasedTerm)
      )
      .map((restaurant) => ({ ...restaurant, type: "restaurant" })); // Add type identifier

    // Filter menu items
    const filteredMenuItems = menuItems
      .filter((item) => item.name.toLowerCase().includes(lowercasedTerm))
      .map((item) => ({ ...item, type: "food" })); // Add type identifier

    return [...filteredRestaurants, ...filteredMenuItems];
  }, [searchTerm, restaurants, menuItems]);

  const getRestaurantName = (restaurantId) => {
    return restaurants.find(r => r.id === restaurantId)?.name || 'Unknown Restaurant';
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header and Search Bar */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">
            Find Your Craving
          </h1>
          <p className="text-lg text-gray-600">
            Search for restaurants or your favorite dishes.
          </p>
        </div>
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Search for 'Pizza', 'Burger Junction', etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 shadow-sm"
          />
        </div>

        {/* Results Section */}
        <div>
          {searchTerm.length > 0 ? (
            filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((item) =>
                  item.type === "restaurant" ? (
                    // Restaurant Card
                    <div key={`rest-${item.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <img src={item.image} alt={item.name} className="w-full h-40 object-cover"/>
                      <div className="p-4">
                        <div className="flex items-center text-xs text-red-600 font-semibold mb-1">
                            <Store className="w-4 h-4 mr-2" />
                            RESTAURANT
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.cuisine}</p>
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Food Item Card
                    <div key={`food-${item.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <img src={item.image} alt={item.name} className="w-full h-40 object-cover"/>
                      <div className="p-4">
                        <div className="flex items-center text-xs text-green-600 font-semibold mb-1">
                            <UtensilsCrossed className="w-4 h-4 mr-2" />
                            DISH
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">From: {getRestaurantName(item.restaurantId)}</p>
                        <div className="text-lg font-bold text-green-700">₹{item.price}</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              // No Results Found
              <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800">No Results Found</h3>
                <p className="text-gray-500 mt-2">
                  We couldn't find anything for "{searchTerm}". Try a different search.
                </p>
              </div>
            )
          ) : (
            // Initial State (before searching)
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800">What are you looking for?</h3>
              <p className="text-gray-500 mt-2">
                Start typing above to see matching restaurants and dishes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};