import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Clock, MapPin, Filter, Search, Grid, List, Share2, Trash2 } from 'lucide-react';

const FoodWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Truffle Mushroom Risotto",
      price: 28.99,
      originalPrice: 32.99,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=200&fit=crop&crop=center",
      restaurant: "Casa Italiana",
      rating: 4.8,
      reviews: 245,
      deliveryTime: "25-35 min",
      category: "Italian",
      description: "Creamy arborio rice with wild mushrooms and truffle oil",
      isAvailable: true,
      discount: 12
    },
    {
      id: 2,
      name: "Wagyu Beef Burger",
      price: 24.50,
      originalPrice: 24.50,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop&crop=center",
      restaurant: "Grill Master",
      rating: 4.9,
      reviews: 189,
      deliveryTime: "20-30 min",
      category: "American",
      description: "Premium wagyu beef with aged cheddar and brioche bun",
      isAvailable: true,
      discount: 0
    },
    {
      id: 3,
      name: "Dragon Roll Sushi",
      price: 18.99,
      originalPrice: 22.99,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop&crop=center",
      restaurant: "Sakura Sushi",
      rating: 4.7,
      reviews: 156,
      deliveryTime: "15-25 min",
      category: "Japanese",
      description: "Eel and cucumber topped with avocado and unagi sauce",
      isAvailable: true,
      discount: 17
    },
    {
      id: 4,
      name: "Chocolate Lava Cake",
      price: 9.99,
      originalPrice: 9.99,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop&crop=center",
      restaurant: "Sweet Dreams",
      rating: 4.6,
      reviews: 203,
      deliveryTime: "10-20 min",
      category: "Dessert",
      description: "Warm chocolate cake with molten center and vanilla ice cream",
      isAvailable: true,
      discount: 0
    },
    {
      id: 5,
      name: "Lamb Biryani",
      price: 22.99,
      originalPrice: 26.99,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d293?w=300&h=200&fit=crop&crop=center",
      restaurant: "Spice Route",
      rating: 4.5,
      reviews: 178,
      deliveryTime: "30-40 min",
      category: "Indian",
      description: "Fragrant basmati rice with tender lamb and aromatic spices",
      isAvailable: true,
      discount: 15
    },
    {
      id: 6,
      name: "Acai Bowl",
      price: 14.99,
      originalPrice: 14.99,
      image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=200&fit=crop&crop=center",
      restaurant: "Healthy Bites",
      rating: 4.4,
      reviews: 92,
      deliveryTime: "15-25 min",
      category: "Healthy",
      description: "Fresh acai topped with granola, berries, and coconut",
      isAvailable: true,
      discount: 0
    }
  ]);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('added');

  const categories = ['all', 'Italian', 'American', 'Japanese', 'Indian', 'Dessert', 'Healthy'];

  const removeFromWishlist = (id) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (item) => {
    alert(`${item.name} added to cart!`);
  };

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {sortedItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="relative">
            <img 
              src={item.image} 
              alt={item.name}
              className={`w-full h-48 object-cover ${!item.isAvailable ? 'grayscale opacity-60' : ''}`}
            />
            {/* {item.discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                {item.discount}% OFF
              </div>
            )} */}
            {/* {!item.isAvailable && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                  Currently Unavailable
                </span>
              </div>
            )} */}
            <button 
              onClick={() => removeFromWishlist(item.id)}
              className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors group"
            >
              <Heart className="w-4 h-4 text-red-500 fill-current group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.restaurant}</p>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({item.reviews})</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {item.deliveryTime}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
               
              </div>
              <button 
                onClick={() => addToCart(item)}
                disabled={!item.isAvailable}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
          <div className="flex gap-4">
            <div className="relative">
              <img 
                src={item.image} 
                alt={item.name}
                className={`w-24 h-24 rounded-lg object-cover ${!item.isAvailable ? 'grayscale opacity-60' : ''}`}
              />
              {/* {item.discount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {item.discount}%
                </div>
              )} */}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.restaurant}</p>
                  {!item.isAvailable && (
                    <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mt-1">
                      Unavailable
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{item.rating}</span>
                    <span className="text-sm text-gray-500">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {item.deliveryTime}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                    {/* {item.originalPrice > item.price && (
                      <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                    )} */}
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
              <p className="text-gray-600">{wishlistItems.length} saved items</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Share2 className="w-4 h-4" />
              Share Wishlist
            </button> */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600'} transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {/* <div className="bg-white rounded-xl shadow-sm p-6 mb-6"> */}
        {/* <div className="flex flex-col lg:flex-row gap-4"> */}
          {/* Search */}
          {/* <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div> */}
          
          {/* Category Filter */}
          {/* <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select> */}
          
          {/* Sort */}
          {/* <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="added">Recently Added</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select> */}
        {/* </div> */}
      {/* </div> */}

      {/* Items */}
      {sortedItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No items found</h2>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? "Try adjusting your filters" 
              : "Start adding your favorite dishes to your wishlist"}
          </p>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Browse Menu
          </button>
        </div>
      ) : (
        viewMode === 'grid' ? <GridView /> : <ListView />
      )}
    </div>
  );
};

export default FoodWishlist;