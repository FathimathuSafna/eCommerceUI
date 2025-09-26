import { useState } from "react";
import {
  Search,
  Star,
  Clock,
  Heart,
  Plus,
  Minus,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ArrowLeft,
  Info,
  Flame,
  Leaf,
  Award,
  Eye,
  ShoppingCart,
  X,
  Camera,
  Share2,
  Bookmark,
} from "lucide-react";

export const FoodDisplayUI = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: "all",
    dietary: "all",
    rating: "all",
    spiceLevel: "all",
  });

  const categories = [
    { id: "All", name: "All Items", icon: "🍽️" },
    { id: "Appetizers", name: "Appetizers", icon: "🥗" },
    { id: "Main Course", name: "Main Course", icon: "🍛" },
    { id: "Pizza", name: "Pizza", icon: "🍕" },
    { id: "Burgers", name: "Burgers", icon: "🍔" },
    { id: "Desserts", name: "Desserts", icon: "🍰" },
    { id: "Beverages", name: "Beverages", icon: "🥤" },
    { id: "Snacks", name: "Snacks", icon: "🍿" },
  ];

  const foodItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Fresh tomatoes, mozzarella cheese, basil leaves on wood-fired thin crust",
      longDescription: "Our signature Margherita pizza features the finest San Marzano tomatoes, premium mozzarella di bufala, fresh basil leaves, and a drizzle of extra virgin olive oil on our signature wood-fired thin crust. Baked to perfection in our traditional brick oven.",
      price: 299,
      originalPrice: 399,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=400&fit=crop"
      ],
      category: "Pizza",
      rating: 4.5,
      reviewCount: 234,
      prepTime: "15-20 min",
      calories: 450,
      serves: 2,
      isVeg: true,
      isSpicy: false,
      spiceLevel: 0,
      discount: 25,
      tags: ["Popular", "Bestseller", "Wood-fired"],
      nutritionInfo: {
        calories: 450,
        protein: "18g",
        carbs: "52g",
        fat: "16g",
        fiber: "3g"
      },
      ingredients: ["Tomato Sauce", "Mozzarella", "Basil", "Olive Oil", "Pizza Dough"],
      allergens: ["Gluten", "Dairy"],
      restaurant: "Mario's Pizzeria",
      available: true,
      customizations: [
        { name: "Extra Cheese", price: 50 },
        { name: "Extra Basil", price: 20 },
        { name: "Thin Crust", price: 0 }
      ]
    },
    {
      id: 2,
      name: "Chicken Tikka Masala",
      description: "Tender chicken pieces in rich, creamy tomato-based curry with aromatic spices",
      longDescription: "Succulent pieces of chicken tikka simmered in our signature creamy tomato curry, enriched with cashews, onions, and a blend of traditional Indian spices. Served with basmati rice and naan bread.",
      price: 349,
      originalPrice: 399,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop"
      ],
      category: "Main Course",
      rating: 4.7,
      reviewCount: 342,
      prepTime: "25-30 min",
      calories: 520,
      serves: 1,
      isVeg: false,
      isSpicy: true,
      spiceLevel: 3,
      discount: 13,
      tags: ["Bestseller", "Spicy", "Protein Rich"],
      nutritionInfo: {
        calories: 520,
        protein: "35g",
        carbs: "28g",
        fat: "25g",
        fiber: "4g"
      },
      ingredients: ["Chicken", "Tomatoes", "Cream", "Onions", "Garam Masala", "Cashews"],
      allergens: ["Dairy", "Nuts"],
      restaurant: "Spice Garden",
      available: true,
      customizations: [
        { name: "Extra Spicy", price: 0 },
        { name: "Mild Spice", price: 0 },
        { name: "Extra Chicken", price: 80 }
      ]
    },
    {
      id: 3,
      name: "Classic Beef Burger",
      description: "Juicy beef patty with lettuce, tomato, cheese, pickles and special sauce",
      longDescription: "Our signature beef burger features a hand-formed 200g beef patty, grilled to perfection and topped with fresh lettuce, ripe tomatoes, aged cheddar cheese, crispy pickles, and our secret burger sauce on a toasted brioche bun.",
      price: 249,
      originalPrice: 299,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop"
      ],
      category: "Burgers",
      rating: 4.3,
      reviewCount: 156,
      prepTime: "12-18 min",
      calories: 650,
      serves: 1,
      isVeg: false,
      isSpicy: false,
      spiceLevel: 1,
      discount: 17,
      tags: ["Popular", "Juicy", "Grilled"],
      nutritionInfo: {
        calories: 650,
        protein: "32g",
        carbs: "45g",
        fat: "35g",
        fiber: "3g"
      },
      ingredients: ["Beef Patty", "Brioche Bun", "Lettuce", "Tomato", "Cheddar", "Pickles"],
      allergens: ["Gluten", "Dairy"],
      restaurant: "Burger Junction",
      available: true,
      customizations: [
        { name: "Extra Patty", price: 120 },
        { name: "Extra Cheese", price: 40 },
        { name: "No Pickles", price: 0 }
      ]
    },
    {
      id: 4,
      name: "Caesar Salad",
      description: "Crisp romaine lettuce, parmesan cheese, croutons with classic caesar dressing",
      longDescription: "Fresh romaine lettuce tossed with our house-made Caesar dressing, topped with aged parmesan cheese, herb croutons, and a sprinkle of black pepper. Light, refreshing, and full of flavor.",
      price: 199,
      originalPrice: 229,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop"
      ],
      category: "Appetizers",
      rating: 4.4,
      reviewCount: 89,
      prepTime: "8-12 min",
      calories: 280,
      serves: 1,
      isVeg: true,
      isSpicy: false,
      spiceLevel: 0,
      discount: 13,
      tags: ["Healthy", "Fresh", "Low Calorie"],
      nutritionInfo: {
        calories: 280,
        protein: "12g",
        carbs: "18g",
        fat: "20g",
        fiber: "6g"
      },
      ingredients: ["Romaine Lettuce", "Parmesan", "Croutons", "Caesar Dressing"],
      allergens: ["Dairy", "Gluten"],
      restaurant: "Green Bowl",
      available: true,
      customizations: [
        { name: "Extra Parmesan", price: 30 },
        { name: "Grilled Chicken", price: 80 },
        { name: "No Croutons", price: 0 }
      ]
    },
    {
      id: 5,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten chocolate center, served with vanilla ice cream",
      longDescription: "Decadent chocolate cake with a gooey molten chocolate center that flows out when cut. Served warm with a scoop of premium vanilla ice cream and a drizzle of chocolate sauce.",
      price: 179,
      originalPrice: 199,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop"
      ],
      category: "Desserts",
      rating: 4.8,
      reviewCount: 267,
      prepTime: "10-15 min",
      calories: 420,
      serves: 1,
      isVeg: true,
      isSpicy: false,
      spiceLevel: 0,
      discount: 10,
      tags: ["Bestseller", "Sweet", "Warm"],
      nutritionInfo: {
        calories: 420,
        protein: "6g",
        carbs: "58g",
        fat: "18g",
        fiber: "4g"
      },
      ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Flour", "Ice Cream"],
      allergens: ["Dairy", "Eggs", "Gluten"],
      restaurant: "Sweet Dreams",
      available: true,
      customizations: [
        { name: "Extra Ice Cream", price: 40 },
        { name: "No Ice Cream", price: -30 },
        { name: "Chocolate Sauce", price: 20 }
      ]
    },
    {
      id: 6,
      name: "Mango Smoothie",
      description: "Fresh mango blended with yogurt, honey and a touch of cardamom",
      longDescription: "Refreshing smoothie made with ripe alphonso mangoes, Greek yogurt, organic honey, and a hint of cardamom. Rich in vitamins and probiotics, perfect for a healthy treat.",
      price: 129,
      originalPrice: 149,
      image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop"
      ],
      category: "Beverages",
      rating: 4.6,
      reviewCount: 134,
      prepTime: "5-8 min",
      calories: 180,
      serves: 1,
      isVeg: true,
      isSpicy: false,
      spiceLevel: 0,
      discount: 13,
      tags: ["Healthy", "Fresh", "Vitamin Rich"],
      nutritionInfo: {
        calories: 180,
        protein: "8g",
        carbs: "35g",
        fat: "2g",
        fiber: "3g"
      },
      ingredients: ["Mango", "Greek Yogurt", "Honey", "Cardamom"],
      allergens: ["Dairy"],
      restaurant: "Fresh Juice Corner",
      available: true,
      customizations: [
        { name: "Extra Mango", price: 30 },
        { name: "No Honey", price: 0 },
        { name: "Almond Milk", price: 20 }
      ]
    }
  ];

  // Filter food items
  const filteredFoods = foodItems.filter(food => {
    const matchesSearch = 
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || food.category === selectedCategory;
    
    const matchesPrice = filters.priceRange === "all" ||
      (filters.priceRange === "budget" && food.price <= 200) ||
      (filters.priceRange === "mid" && food.price > 200 && food.price <= 350) ||
      (filters.priceRange === "premium" && food.price > 350);
    
    const matchesDietary = filters.dietary === "all" ||
      (filters.dietary === "veg" && food.isVeg) ||
      (filters.dietary === "non-veg" && !food.isVeg);
    
    const matchesRating = filters.rating === "all" ||
      (filters.rating === "4+" && food.rating >= 4) ||
      (filters.rating === "4.5+" && food.rating >= 4.5);
    
    const matchesSpice = filters.spiceLevel === "all" ||
      (filters.spiceLevel === "mild" && food.spiceLevel <= 1) ||
      (filters.spiceLevel === "medium" && food.spiceLevel === 2) ||
      (filters.spiceLevel === "hot" && food.spiceLevel >= 3);

    return matchesSearch && matchesCategory && matchesPrice && matchesDietary && matchesRating && matchesSpice;
  });

  const addToCart = (food) => {
    const existingItem = cart.find(item => item.id === food.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
  };

  const removeFromCart = (foodId) => {
    const existingItem = cart.find(item => item.id === foodId);
    if (existingItem && existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== foodId));
    } else {
      setCart(cart.map(item =>
        item.id === foodId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
  };

  const getCartQuantity = (foodId) => {
    const item = cart.find(item => item.id === foodId);
    return item ? item.quantity : 0;
  };

  const toggleFavorite = (foodId) => {
    if (favorites.includes(foodId)) {
      setFavorites(favorites.filter(id => id !== foodId));
    } else {
      setFavorites([...favorites, foodId]);
    }
  };

  const openFoodDetail = (food) => {
    setSelectedFood(food);
    setShowFoodDetail(true);
  };

  const getSpiceIndicator = (level) => {
    const indicators = [];
    for (let i = 0; i < 3; i++) {
      indicators.push(
        <Flame
          key={i}
          className={`w-3 h-3 ${i < level ? "text-red-500 fill-current" : "text-gray-300"}`}
        />
      );
    }
    return indicators;
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
              <h1 className="text-xl font-bold text-gray-900">Menu</h1>
              <span className="text-sm text-gray-500">({filteredFoods.length} items)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              
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
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          {/* Category Pills */}
          <div className="flex space-x-3 mb-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">All Prices</option>
                    <option value="budget">Under ₹200</option>
                    <option value="mid">₹200 - ₹350</option>
                    <option value="premium">Above ₹350</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary</label>
                  <select
                    value={filters.dietary}
                    onChange={(e) => setFilters({...filters, dietary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">All Items</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spice Level</label>
                  <select
                    value={filters.spiceLevel}
                    onChange={(e) => setFilters({...filters, spiceLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">All Levels</option>
                    <option value="mild">Mild 🌶️</option>
                    <option value="medium">Medium 🌶️🌶️</option>
                    <option value="hot">Hot 🌶️🌶️🌶️</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Food Items Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-red-200 group"
              >
                <div className="relative">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Discount Badge */}
                  {food.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                      {food.discount}% OFF
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <button
                      onClick={() => toggleFavorite(food.id)}
                      className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all shadow-lg hover:scale-110"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          favorites.includes(food.id)
                            ? "text-red-500 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => openFoodDetail(food)}
                      className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all shadow-lg hover:scale-110"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Food Tags */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                    {food.isVeg && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Leaf className="w-3 h-3 mr-1" />
                      </span>
                    )}
                    {food.isSpicy && food.spiceLevel > 0 && (
                      <div className="bg-orange-100 px-2 py-1 rounded-full flex items-center space-x-1">
                        {getSpiceIndicator(food.spiceLevel)}
                      </div>
                    )}
                    {food.tags.includes("Bestseller") && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Award className="w-3 h-3 mr-1" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                      {food.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {food.description}
                  </p>

                  {/* Rating and Prep Time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-green-600 fill-current" />
                      <span className="text-sm font-semibold text-green-600">{food.rating}</span>
                      <span className="text-xs text-gray-500">({food.reviewCount})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{food.prepTime}</span>
                    </div>
                  </div>

                  {/* Price and Nutrition */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">₹{food.price}</span>
                      {food.originalPrice > food.price && (
                        <span className="text-sm text-gray-500 line-through">₹{food.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{food.calories} cal</span>
                  </div>

                  {/* Restaurant Info */}
                  <div className="text-xs text-gray-500 mb-3">
                    From {food.restaurant} • Serves {food.serves}
                  </div>

                  {/* Add to Cart Button */}
                  {getCartQuantity(food.id) > 0 ? (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-2">
                      <button
                        onClick={() => removeFromCart(food.id)}
                        className="p-1 hover:bg-red-200 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4 text-red-600" />
                      </button>
                      <span className="font-bold text-red-600">
                        {getCartQuantity(food.id)}
                      </span>
                      <button
                        onClick={() => addToCart(food)}
                        className="p-1 hover:bg-red-200 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(food)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
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
              <div
                key={food.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-red-200"
              >
                <div className="flex items-start space-x-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-32 h-32 rounded-xl object-cover"
                    />
                    {food.discount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg">
                        {food.discount}% OFF
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 hover:text-red-600 transition-colors mb-1">
                          {food.name}
                        </h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {food.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          From {food.restaurant} • Serves {food.serves} • {food.calories} calories
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleFavorite(food.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              favorites.includes(food.id)
                                ? "text-red-500 fill-current"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => openFoodDetail(food)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Tags and Indicators */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-green-600 fill-current" />
                        <span className="text-sm font-semibold text-green-600">{food.rating}</span>
                        <span className="text-xs text-gray-500">({food.reviewCount} reviews)</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{food.prepTime}</span>
                      </div>

                      {food.isVeg && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                          <Leaf className="w-3 h-3 mr-1" />
                          Veg
                        </span>
                      )}
                      
                      {food.isSpicy && food.spiceLevel > 0 && (
                        <div className="bg-orange-100 px-3 py-1 rounded-full flex items-center space-x-1">
                          <span className="text-xs font-medium text-orange-800 mr-1">Spice:</span>
                          {getSpiceIndicator(food.spiceLevel)}
                        </div>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">₹{food.price}</span>
                          {food.originalPrice > food.price && (
                            <span className="text-lg text-gray-500 line-through">₹{food.originalPrice}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {food.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Add to Cart */}
                      {getCartQuantity(food.id) > 0 ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-2">
                            <button
                              onClick={() => removeFromCart(food.id)}
                              className="p-1 hover:bg-red-200 rounded transition-colors"
                            >
                              <Minus className="w-4 h-4 text-red-600" />
                            </button>
                            <span className="font-bold text-red-600 min-w-[24px] text-center">
                              {getCartQuantity(food.id)}
                            </span>
                            <button
                              onClick={() => addToCart(food)}
                              className="p-1 hover:bg-red-200 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(food)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredFoods.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No food items found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any food items matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setFilters({
                  priceRange: "all",
                  dietary: "all",
                  rating: "all",
                  spiceLevel: "all",
                });
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Food Detail Modal */}
      {showFoodDetail && selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">Food Details</h2>
                <button
                  onClick={() => setShowFoodDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Food Images */}
              <div className="relative">
                <img
                  src={selectedFood.image}
                  alt={selectedFood.name}
                  className="w-full h-64 object-cover"
                />
                {selectedFood.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg font-semibold">
                    {selectedFood.discount}% OFF
                  </div>
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all shadow-lg">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedFood.id)}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all shadow-lg"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        favorites.includes(selectedFood.id)
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Food Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedFood.name}</h1>
                    <p className="text-gray-600 mb-3">{selectedFood.longDescription}</p>
                    <p className="text-sm text-gray-500 mb-4">From {selectedFood.restaurant}</p>
                  </div>
                </div>

                {/* Tags and Indicators */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedFood.isVeg && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Leaf className="w-4 h-4 mr-1" />
                      Vegetarian
                    </span>
                  )}
                  {selectedFood.isSpicy && selectedFood.spiceLevel > 0 && (
                    <div className="bg-orange-100 px-3 py-1 rounded-full flex items-center space-x-1">
                      <span className="text-sm font-medium text-orange-800 mr-1">Spice Level:</span>
                      {getSpiceIndicator(selectedFood.spiceLevel)}
                    </div>
                  )}
                  {selectedFood.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-5 h-5 text-green-600 fill-current" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{selectedFood.rating}</div>
                    <div className="text-xs text-gray-500">{selectedFood.reviewCount} reviews</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{selectedFood.prepTime}</div>
                    <div className="text-xs text-gray-500">Prep time</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedFood.calories}</div>
                    <div className="text-xs text-gray-500">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedFood.serves}</div>
                    <div className="text-xs text-gray-500">Serves</div>
                  </div>
                </div>

                {/* Nutrition Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Information</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {Object.entries(selectedFood.nutritionInfo).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-900 capitalize">{key}</div>
                        <div className="text-xs text-gray-600">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFood.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Allergens */}
                {selectedFood.allergens.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Allergen Information</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFood.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price and Order */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold text-gray-900">₹{selectedFood.price}</span>
                      {selectedFood.originalPrice > selectedFood.price && (
                        <span className="text-lg text-gray-500 line-through">₹{selectedFood.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {getCartQuantity(selectedFood.id) > 0 ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-2">
                        <button
                          onClick={() => removeFromCart(selectedFood.id)}
                          className="p-2 hover:bg-red-200 rounded transition-colors"
                        >
                          <Minus className="w-5 h-5 text-red-600" />
                        </button>
                        <span className="font-bold text-red-600 text-xl min-w-[32px] text-center">
                          {getCartQuantity(selectedFood.id)}
                        </span>
                        <button
                          onClick={() => addToCart(selectedFood)}
                          className="p-2 hover:bg-red-200 rounded transition-colors"
                        >
                          <Plus className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(selectedFood)}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <div className="font-bold">
              ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
            </div>
            <button className="bg-white text-red-500 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};