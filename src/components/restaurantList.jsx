import { useState } from "react";
import {
  Search,
  Star,
  Clock,
  MapPin,
  Filter,
  Heart,
  ArrowLeft,
  Grid3X3,
  List,
  ChevronDown,
  Phone,
  Navigation,
  Award,
  Percent,
  Truck,
  ChefHat,
  Users,
  Utensils,
  Timer,
} from "lucide-react";


export const RestaurantListUI = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    rating: "all",
    deliveryTime: "all",
    priceRange: "all",
    offers: false,
    freeDelivery: false,
  });

  const cuisines = [
    "All", "Pizza", "Indian", "Chinese", "Italian", "Mexican", 
    "Thai", "Japanese", "American", "Mediterranean", "Desserts"
  ];

  const restaurants = [
    {
      id: 1,
      name: "Mario's Pizzeria",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
      cuisine: "Pizza • Italian",
      rating: 4.5,
      reviewCount: 1234,
      deliveryTime: "25-35 min",
      deliveryFee: 29,
      distance: "1.2 km",
      priceRange: "₹₹",
      minOrder: 199,
      discount: "50% OFF up to ₹100",
      isOpen: true,
      description: "Authentic wood-fired pizzas with fresh ingredients",
      specialties: ["Margherita Pizza", "Pepperoni", "Garlic Bread"],
      offers: ["50% OFF", "Free Delivery on ₹299+"],
      tags: ["Popular", "Fast Delivery"],
      address: "123 Food Street, Kanayannur",
      phone: "+91 9876543210",
    },
    {
      id: 2,
      name: "Spice Garden",
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop",
      cuisine: "North Indian • Biryani",
      rating: 4.7,
      reviewCount: 2156,
      deliveryTime: "35-45 min",
      deliveryFee: 39,
      distance: "2.3 km",
      priceRange: "₹₹₹",
      minOrder: 299,
      discount: "30% OFF up to ₹150",
      isOpen: true,
      description: "Authentic North Indian flavors with aromatic biryanis",
      specialties: ["Chicken Biryani", "Butter Chicken", "Naan"],
      offers: ["30% OFF", "Free Raita"],
      tags: ["Bestseller", "Premium"],
      address: "456 Spice Lane, Kanayannur",
      phone: "+91 9876543211",
    },
    {
      id: 3,
      name: "Dragon Wok",
      image: "https://images.unsplash.com/photo-1512003867696-6d5ce6835040?w=400&h=300&fit=crop",
      cuisine: "Chinese • Thai",
      rating: 4.3,
      reviewCount: 856,
      deliveryTime: "30-40 min",
      deliveryFee: 0,
      distance: "1.8 km",
      priceRange: "₹₹",
      minOrder: 249,
      discount: "40% OFF up to ₹120",
      isOpen: true,
      description: "Wok-tossed Chinese dishes and Thai curries",
      specialties: ["Fried Rice", "Chow Mein", "Thai Curry"],
      offers: ["40% OFF", "Free Delivery"],
      tags: ["Free Delivery", "New"],
      address: "789 Asia Street, Kanayannur",
      phone: "+91 9876543212",
    },
    {
      id: 4,
      name: "Burger Junction",
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
      cuisine: "American • Fast Food",
      rating: 4.2,
      reviewCount: 945,
      deliveryTime: "20-30 min",
      deliveryFee: 25,
      distance: "0.9 km",
      priceRange: "₹",
      minOrder: 149,
      discount: "25% OFF up to ₹75",
      isOpen: true,
      description: "Juicy burgers and crispy fries made fresh daily",
      specialties: ["Classic Burger", "Chicken Burger", "Fries"],
      offers: ["25% OFF", "Buy 1 Get 1"],
      tags: ["Fast Delivery", "Budget"],
      address: "321 Burger Ave, Kanayannur",
      phone: "+91 9876543213",
    },
    {
      id: 5,
      name: "Green Bowl",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
      cuisine: "Healthy • Salads",
      rating: 4.6,
      reviewCount: 678,
      deliveryTime: "25-35 min",
      deliveryFee: 30,
      distance: "1.5 km",
      priceRange: "₹₹",
      minOrder: 199,
      discount: "20% OFF up to ₹80",
      isOpen: true,
      description: "Fresh, healthy meals for conscious eaters",
      specialties: ["Caesar Salad", "Quinoa Bowl", "Smoothies"],
      offers: ["20% OFF", "Healthy Choice"],
      tags: ["Healthy", "Organic"],
      address: "567 Health St, Kanayannur",
      phone: "+91 9876543214",
    },
    {
      id: 6,
      name: "Sweet Dreams",
      image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
      cuisine: "Desserts • Bakery",
      rating: 4.8,
      reviewCount: 1567,
      deliveryTime: "15-25 min",
      deliveryFee: 20,
      distance: "0.7 km",
      priceRange: "₹₹",
      minOrder: 99,
      discount: "15% OFF up to ₹50",
      isOpen: true,
      description: "Heavenly cakes and desserts made with love",
      specialties: ["Chocolate Cake", "Cheesecake", "Pastries"],
      offers: ["15% OFF", "Free Delivery on ₹199+"],
      tags: ["Top Rated", "Sweet"],
      address: "890 Sweet Lane, Kanayannur",
      phone: "+91 9876543215",
    },
  ];

  // Filter restaurants based on search and filters
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCuisine = selectedCuisine === "All" || 
      restaurant.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
    
    const matchesRating = filters.rating === "all" ||
      (filters.rating === "4+" && restaurant.rating >= 4) ||
      (filters.rating === "4.5+" && restaurant.rating >= 4.5);
    
    const matchesDeliveryTime = filters.deliveryTime === "all" ||
      (filters.deliveryTime === "fast" && parseInt(restaurant.deliveryTime.split("-")[0]) <= 25) ||
      (filters.deliveryTime === "medium" && parseInt(restaurant.deliveryTime.split("-")[0]) <= 40);
    
    const matchesPriceRange = filters.priceRange === "all" ||
      (filters.priceRange === "budget" && restaurant.priceRange === "₹") ||
      (filters.priceRange === "mid" && restaurant.priceRange === "₹₹") ||
      (filters.priceRange === "premium" && restaurant.priceRange === "₹₹₹");
    
    const matchesOffers = !filters.offers || restaurant.offers.length > 0;
    const matchesFreeDelivery = !filters.freeDelivery || restaurant.deliveryFee === 0;

    return matchesSearch && matchesCuisine && matchesRating && 
           matchesDeliveryTime && matchesPriceRange && matchesOffers && matchesFreeDelivery;
  });

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "delivery_time":
        return parseInt(a.deliveryTime.split("-")[0]) - parseInt(b.deliveryTime.split("-")[0]);
      case "distance":
        return parseFloat(a.distance) - parseFloat(b.distance);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return b.rating - a.rating;
    }
  });

  const toggleFavorite = (restaurantId) => {
    if (favorites.includes(restaurantId)) {
      setFavorites(favorites.filter(id => id !== restaurantId));
    } else {
      setFavorites([...favorites, restaurantId]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Restaurants</h1>
              <span className="text-sm text-gray-500">({sortedRestaurants.length} found)</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          {/* Cuisine Filter Pills */}
          <div className="flex space-x-3 mb-4 overflow-x-auto pb-2">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCuisine === cuisine
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
              >
                <option value="rating">Highest Rated</option>
                <option value="delivery_time">Fastest Delivery</option>
                <option value="distance">Nearest</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">All Ratings</option>
                    <option value="4+">4.0+ ⭐</option>
                    <option value="4.5+">4.5+ ⭐</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                  <select
                    value={filters.deliveryTime}
                    onChange={(e) => setFilters({...filters, deliveryTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">Any Time</option>
                    <option value="fast">Under 25 min</option>
                    <option value="medium">Under 40 min</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">All Prices</option>
                    <option value="budget">₹ Budget</option>
                    <option value="mid">₹₹ Mid-range</option>
                    <option value="premium">₹₹₹ Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.offers}
                        onChange={(e) => setFilters({...filters, offers: e.target.checked})}
                        className="rounded text-red-500 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm">Has Offers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.freeDelivery}
                        onChange={(e) => setFilters({...filters, freeDelivery: e.target.checked})}
                        className="rounded text-red-500 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm">Free Delivery</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-red-200 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Discount Badge */}
                  {restaurant.discount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
                      {restaurant.discount.split(' ')[0]} {restaurant.discount.split(' ')[1]}
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(restaurant.id)}
                    className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all shadow-lg hover:scale-110"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        favorites.includes(restaurant.id)
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  </button>

                  {/* Status & Delivery Fee */}
                  <div className="absolute bottom-3 left-3 flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      restaurant.isOpen 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {restaurant.isOpen ? "Open" : "Closed"}
                    </span>
                    {restaurant.deliveryFee === 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Free Delivery
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <span className="text-sm font-medium text-gray-600">
                      {restaurant.priceRange}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {restaurant.cuisine}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-green-600 fill-current" />
                        <span className="text-sm font-semibold text-green-600">
                          {restaurant.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({restaurant.reviewCount.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.distance}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4" />
                      <span>{restaurant.deliveryFee === 0 ? "Free" : `₹${restaurant.deliveryFee}`}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-1">Popular:</p>
                    <p className="text-sm text-gray-700 line-clamp-1">
                      {restaurant.specialties.slice(0, 2).join(", ")}
                    </p>
                  </div>

                  <button className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors">
                    View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-red-200 cursor-pointer"
              >
                <div className="flex items-start space-x-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-32 h-24 rounded-lg object-cover"
                    />
                    {restaurant.discount && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg">
                        {restaurant.discount.split(' ')[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 hover:text-red-600 transition-colors mb-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-gray-600 mb-1">{restaurant.cuisine} • {restaurant.priceRange}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{restaurant.description}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(restaurant.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Heart
                          className={`w-6 h-6 transition-colors ${
                            favorites.includes(restaurant.id)
                              ? "text-red-500 fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6 mb-3">
                      <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-green-600 fill-current" />
                        <span className="text-sm font-semibold text-green-600">{restaurant.rating}</span>
                        <span className="text-xs text-gray-500">({restaurant.reviewCount.toLocaleString()})</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{restaurant.deliveryTime}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{restaurant.distance}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Truck className="w-4 h-4" />
                        <span className="text-sm">
                          {restaurant.deliveryFee === 0 ? "Free delivery" : `₹${restaurant.deliveryFee} delivery`}
                        </span>
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        restaurant.isOpen 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Popular items:</p>
                        <p className="text-sm text-gray-700">{restaurant.specialties.join(" • ")}</p>
                        <p className="text-xs text-gray-500 mt-1">Min order: ₹{restaurant.minOrder}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button className="p-2 border border-gray-300 hover:border-red-300 rounded-lg transition-colors group">
                          <Phone className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        </button>
                        <button className="p-2 border border-gray-300 hover:border-red-300 rounded-lg transition-colors group">
                          <Navigation className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                          View Menu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {sortedRestaurants.length === 0 && (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCuisine("All");
                setFilters({
                  rating: "all",
                  deliveryTime: "all",
                  priceRange: "all",
                  offers: false,
                  freeDelivery: false,
                });
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};