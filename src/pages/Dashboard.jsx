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

export const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const navigate = useNavigate();

  const categories = [
    "All",
    "Pizza",
    "Burgers",
    "Indian",
    "Chinese",
    "Desserts",
    "Beverages",
  ];

  // Simulate API data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Sample restaurants data
      const restaurantsData = [
        {
          id: 1,
          name: "Mario's Pizzeria",
          image:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop",
          rating: 4.5,
          deliveryTime: "30-40",
          cuisine: "Pizza, Italian",
          category: "Pizza",
          priceRange: "₹₹",
          distance: "2.1 km",
          discount: "50% OFF",
          description:
            "Authentic Italian pizzas made with fresh ingredients and traditional recipes. Our wood-fired oven delivers the perfect crispy crust every time.",
          address: "123 Italian Street, Downtown",
          phone: "+91 98765 43210",
          openTime: "11:00 AM - 11:00 PM",
          minimumOrder: 199,
          deliveryFee: 29,
          reviews: 1250,
          specialties: ["Wood-fired Pizza", "Garlic Bread", "Tiramisu"],
        },
        {
          id: 2,
          name: "Burger Junction",
          image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop",
          rating: 4.2,
          deliveryTime: "25-35",
          cuisine: "Burgers, Fast Food",
          category: "Burgers",
          priceRange: "₹",
          distance: "1.8 km",
          discount: "30% OFF",
          description:
            "Juicy burgers made with premium beef patties and fresh vegetables. Quick service without compromising on taste.",
          address: "456 Burger Lane, Food Court",
          phone: "+91 98765 43211",
          openTime: "10:00 AM - 12:00 AM",
          minimumOrder: 149,
          deliveryFee: 25,
          reviews: 890,
          specialties: ["Classic Burger", "Cheese Fries", "Milkshakes"],
        },
        {
          id: 3,
          name: "Spice Garden",
          image:
            "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop",
          rating: 4.7,
          deliveryTime: "35-45",
          cuisine: "North Indian, Biryani",
          category: "Indian",
          priceRange: "₹₹₹",
          distance: "3.2 km",
          discount: "25% OFF",
          description:
            "Experience the rich flavors of North Indian cuisine with our aromatic biryanis and traditional curries prepared by expert chefs.",
          address: "789 Spice Street, Old City",
          phone: "+91 98765 43212",
          openTime: "12:00 PM - 11:30 PM",
          minimumOrder: 299,
          deliveryFee: 35,
          reviews: 2100,
          specialties: ["Chicken Biryani", "Butter Chicken", "Naan"],
        },
        {
          id: 4,
          name: "Dragon Wok",
          image:
            "https://images.unsplash.com/photo-1512003867696-6d5ce6835040?w=300&h=200&fit=crop",
          rating: 4.3,
          deliveryTime: "40-50",
          cuisine: "Chinese, Thai",
          category: "Chinese",
          priceRange: "₹₹",
          distance: "2.8 km",
          discount: "40% OFF",
          description:
            "Authentic Chinese and Thai dishes prepared with traditional cooking techniques and fresh ingredients imported directly from Asia.",
          address: "321 Dragon Road, China Town",
          phone: "+91 98765 43213",
          openTime: "11:30 AM - 10:30 PM",
          minimumOrder: 249,
          deliveryFee: 30,
          reviews: 756,
          specialties: ["Hakka Noodles", "Sweet & Sour", "Thai Curry"],
        },
        {
          id: 5,
          name: "Sweet Dreams",
          image:
            "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop",
          rating: 4.6,
          deliveryTime: "20-30",
          cuisine: "Desserts, Ice Cream",
          category: "Desserts",
          priceRange: "₹₹",
          distance: "1.5 km",
          discount: "20% OFF",
          description:
            "Indulge in our heavenly desserts and premium ice creams. From classic cakes to innovative sundaes, we make every moment sweet.",
          address: "654 Sweet Avenue, Mall Road",
          phone: "+91 98765 43214",
          openTime: "9:00 AM - 11:00 PM",
          minimumOrder: 99,
          deliveryFee: 20,
          reviews: 1890,
          specialties: ["Chocolate Cake", "Vanilla Ice Cream", "Pastries"],
        },
        {
          id: 6,
          name: "Fresh Brew Cafe",
          image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
          rating: 4.4,
          deliveryTime: "15-25",
          cuisine: "Coffee, Beverages",
          category: "Beverages",
          priceRange: "₹",
          distance: "0.9 km",
          discount: "15% OFF",
          description:
            "Premium coffee beans sourced from the best plantations. Whether you need your morning boost or evening relaxation, we've got the perfect brew.",
          address: "987 Coffee Street, Business District",
          phone: "+91 98765 43215",
          openTime: "6:00 AM - 10:00 PM",
          minimumOrder: 79,
          deliveryFee: 15,
          reviews: 1456,
          specialties: ["Cappuccino", "Cold Brew", "Sandwiches"],
        },
      ];

      const menuItemsData = [
        {
          id: 1,
          restaurantId: 1,
          name: "Margherita Pizza",
          price: 299,
          image:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop",
          category: "Pizza",
        },
        {
          id: 2,
          restaurantId: 1,
          name: "Pepperoni Pizza",
          price: 399,
          image:
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=150&h=150&fit=crop",
          category: "Pizza",
        },
        {
          id: 3,
          restaurantId: 2,
          name: "Classic Burger",
          price: 199,
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop",
          category: "Burgers",
        },
        {
          id: 4,
          restaurantId: 3,
          name: "Chicken Biryani",
          price: 249,
          image:
            "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=150&h=150&fit=crop",
          category: "Indian",
        },
        {
          id: 5,
          restaurantId: 4,
          name: "Fried Rice",
          price: 179,
          image:
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=150&h=150&fit=crop",
          category: "Chinese",
        },
        {
          id: 6,
          restaurantId: 5,
          name: "Chocolate Cake",
          price: 149,
          image:
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop",
          category: "Desserts",
        },
        {
          id: 7,
          restaurantId: 6,
          name: "Cappuccino",
          price: 99,
          image:
            "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&h=150&fit=crop",
          category: "Beverages",
        },
      ];

      setRestaurants(restaurantsData);
      setMenuItems(menuItemsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || restaurant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openRestaurantModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRestaurant(null);
  };

  const addToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === itemId);
    if (existingItem.quantity === 1) {
      setCartItems(cartItems.filter((cartItem) => cartItem.id !== itemId));
    } else {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
  };

  const toggleFavorite = (restaurantId) => {
    if (favorites.includes(restaurantId)) {
      setFavorites(favorites.filter((id) => id !== restaurantId));
    } else {
      setFavorites([...favorites, restaurantId]);
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

  const getRestaurantMenuItems = (restaurantId) => {
    return menuItems.filter((item) => item.restaurantId === restaurantId);
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
      <Navigation tranparent />
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  Free delivery on first order
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                  Craving
                  <span className="relative inline-block mx-4">
                    <span className="text-red-500">Food?</span>
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3"
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

                <p className="text-xl text-gray-700 mb-8 max-w-lg">
                  Order from your favorite local restaurants and get it
                  delivered fresh to your doorstep in minutes.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => navigate("/restaurants")}
                  >
                    Order Now
                  </button>
                </div>
              </div>

              {/* Right side image */}
              <div className="relative">
                <div className="relative z-10">
                  <div
                    className="d-flex align-items-center justify-content-center text-center text-white"
                    style={{
                      minHeight: "60vh",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                    }}
                  ></div>
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
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
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

          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {filteredRestaurants.length} restaurants found
            </h2>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Restaurant Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-red-200 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => openRestaurantModal(restaurant)}
                  />
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {restaurant.discount}
                    </span>
                    <button
                      onClick={() => toggleFavorite(restaurant.id)}
                      className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.includes(restaurant.id)
                            ? "text-red-500 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {restaurant.name}
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {restaurant.priceRange}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {restaurant.cuisine}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-green-500 fill-current" />
                        <span className="text-sm font-medium">
                          {restaurant.rating}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {restaurant.deliveryTime} mins
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {restaurant.distance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="justify-end space-x-2 mt-4">
              <button
                className="flex items-center text-sm font-medium bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => navigate("/food")}
              >
                <span>More</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Simple Restaurant Modal */}
        {showModal && selectedRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRestaurant.name}
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
                {/* Delivery Time */}
                <div className="flex items-center justify-center mb-6 bg-blue-50 p-4 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-blue-700 font-semibold">
                    Delivery: {selectedRestaurant.deliveryTime} mins
                  </span>
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Available Items
                  </h3>
                  {getRestaurantMenuItems(selectedRestaurant.id).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-green-600 font-semibold">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(item);
                          closeModal();
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
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
                        key={item.id}
                        className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                      >
                        <img
                          src={item.image}
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
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
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
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};
