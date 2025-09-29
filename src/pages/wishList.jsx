import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Grid, List, Trash2, Search,ArrowLeft } from 'lucide-react';
import { likeFood, removeLike, fetchLikes } from "../services/likeAPI";
import { addToCart } from "../services/cartAPI";
import { toast } from 'react-toastify'; 
import { Navigation } from "../components/Navigation";
import { useNavigate } from 'react-router-dom';


const FoodWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('added');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()


  // Deriving categories from the items themselves for accuracy
  const categories = ['all', ...new Set(wishlistItems.map(item => item.category))];

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetchLikes();
      if (Array.isArray(response.data)) {
        const mappedItems = response.data.map(item => ({
          ...item,
          // Safely access nested properties with optional chaining and fallbacks
          id: item.foodId?._id || item._id, // Ensure a unique ID for keys
          name: item.foodId?.name || 'Unknown Food',
          image: item.foodId?.image || 'https://via.placeholder.com/300',
          price: item.foodId?.price || 0,
          category: item.foodId?.category || 'General',
          restaurantName: item.foodId?.restaurantId?.restaurantsName || 'Unknown Restaurant',
        }));
        setWishlistItems(mappedItems);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Could not load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = async (foodId, itemName) => {
    try {
      await removeLike(foodId);
      setWishlistItems(items => items.filter(item => item.id !== foodId));
      toast.warn(`${itemName} removed from wishlist.`);
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item.");
    }
  };

  // Add to cart
  const handleAddToCart = async (item) => {
    try {
      await addToCart(item.id);
      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Could not add item to cart.");
    }
  };

  // Filtering and Sorting Logic
  const sortedAndFilteredItems = wishlistItems
    .filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0; // 'added' doesn't require sorting if array is naturally ordered
      }
    });

  if (loading) {
    return <p className="text-center mt-12 text-gray-500">Loading your wishlist...</p>;
  }

  // Grid view with smaller, responsive cards
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedAndFilteredItems.map(item => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <div className="relative">
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover" /> {/* Smaller image */}
            <button
              onClick={() => removeFromWishlist(item.id, item.name)}
              className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-red-100 transition-colors"
            >
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </button>
          </div>
          <div className="p-3 flex flex-col flex-grow"> {/* Reduced padding */}
            <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{item.restaurantName}</p>
            <div className="flex-grow"></div> {/* Pushes content below to the bottom */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
              <button
                onClick={() => handleAddToCart(item)}
                className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ShoppingCart className="w-4 h-4" />
                MOVE TO CART
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // List view with more compact styling
  const ListView = () => (
    <div className="space-y-3">
      {sortedAndFilteredItems.map(item => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm p-3 flex gap-4 hover:shadow-lg transition-shadow duration-300">
          <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" /> {/* Smaller image */}
          <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.restaurantName}</p>
              <p className="text-md font-bold text-orange-600 sm:hidden mt-1">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
               <span className="text-lg font-bold text-orange-600 hidden sm:block">₹{item.price}</span>
              <button
                onClick={() => handleAddToCart(item)}
                className="bg-orange-100 text-orange-700 p-2 rounded-lg hover:bg-orange-200"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button onClick={() => removeFromWishlist(item.id, item.name)} className="text-gray-400 hover:text-red-500 p-2">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <><Navigation/>
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
     <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
      <button
  className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-800 font-medium mb-4"
  onClick={() => navigate("/")}
>
  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
  Back
</button>

  {/* <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
    Wishlist ({wishlistItems.length})
  </h1> */}
  <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm text-gray-600">
    <button
      onClick={() => setViewMode('grid')}
      className={`p-1 sm:p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-orange-500 text-white' : ''}`}
    >
      <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
    <button
      onClick={() => setViewMode('list')}
      className={`p-1 sm:p-2 rounded-r-md ${viewMode === 'list' ? 'bg-orange-500 text-white' : ''}`}
    >
      <List className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </div>
</div>


      {/* ADDED: Filter and Sort Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search in wishlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
          {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
          <option value="added">Sort by Date Added</option>
          <option value="name">Sort by Name</option>
          <option value="price-low">Sort by Price (Low to High)</option>
          <option value="price-high">Sort by Price (High to Low)</option>
        </select>
      </div>

      {sortedAndFilteredItems.length === 0
        ? <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
            <p className="text-gray-400">Liked items will appear here!</p>
          </div>
        : viewMode === 'grid' ? <GridView /> : <ListView />
      }
    </div>
     </>
  );
};

export default FoodWishlist;