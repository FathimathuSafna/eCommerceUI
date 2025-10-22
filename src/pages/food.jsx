import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  ArrowLeft,
  Plus,
  Minus,
  MapPin,
  AlertCircle,
  Percent,    // <-- Add this
  CreditCard, // <-- Add this
  Truck,      // <-- Add this
  Gift,       // <-- Add this
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

import { Navigation } from '../components/Navigation';
import { getFoodItemById } from '../services/productAPI';
import { getCartItems, updateCartItem, addToCart } from '../services/cartAPI';
import { isUserLoggedIn, addToLocalCart } from '../utils/cartUtils';

// Constants
const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x600.png?text=No+Image';

// Dummy offers and promotions (can be moved or fetched)
// Dummy offers and promotions (uses Lucide icon components)
const AVAILABLE_OFFERS = [
  {
    id: 1,
    icon: Percent, // Use the component
    title: '50% OFF up to ₹100',
    description: "Use code 'YUMMY50' on orders above ₹199.",
  },
  {
    id: 2,
    icon: CreditCard, // Use the component
    title: 'Flat 20% OFF with HDFC Bank',
    description: 'Valid on all orders paid via HDFC Bank credit or debit cards.',
  },
  {
    id: 3,
    icon: Truck, // Use the component
    title: 'Free Delivery',
    description: 'Get free delivery on all orders above ₹249 from this restaurant.',
  },
  {
    id: 4,
    icon: Gift, // Use the component
    title: 'Buy 1 Get 1 Free',
    description: 'Add 2 eligible items to your cart, pay for only 1. T&C apply.',
  }
];

/**
 * FoodDetailPage Component
 * Displays detailed information about a food item and handles cart operations
 */
export const FoodDetailPage = () => {
  // Router hooks
  const { id: foodId } = useParams();
  const navigate = useNavigate();

  // Authentication state
  const isLoggedIn = isUserLoggedIn();

  // Component state
  const [foodItem, setFoodItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartActionLoading, setIsCartActionLoading] = useState(false);

  // ===================
  // Data Fetching
  // ===================

  const fetchFoodDetails = useCallback(async () => {
    if (!foodId) {
      setError('Food item ID is missing.');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await getFoodItemById(foodId);
      if (response?.data) {
        setFoodItem(response.data);
      } else {
        setError(response?.msg || 'Food item not found.');
      }
    } catch (err) {
      console.error('Error fetching food item:', err);
      setError('Failed to load food item details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [foodId]);

  const loadCartData = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    try {
      const response = await getCartItems();
      if (response?.success && Array.isArray(response.data)) {
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
      console.error('Error loading cart items:', err);
      setCartItems([]);
    }
  }, [isLoggedIn]);

  // Effects
  useEffect(() => {
    fetchFoodDetails();
  }, [fetchFoodDetails]);

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  // ===================
  // Cart Operations
  // ===================

  const getCartItem = useCallback(() => {
    if (!foodItem) return null;
    return cartItems.find((item) => item._id === foodItem._id);
  }, [cartItems, foodItem]);

  const handleUpdateQuantity = useCallback(
    async (currentCartItem, newQuantity) => {
      // ... (logic remains the same)
      if (!isLoggedIn || !currentCartItem?.cartId) {
        toast.info('Please log in to update your cart.');
        return;
      }

      setIsCartActionLoading(true);
      const originalCart = [...cartItems];

      // Optimistic update
      const updatedCart = newQuantity <= 0
        ? originalCart.filter((item) => item.cartId !== currentCartItem.cartId)
        : originalCart.map((item) =>
            item.cartId === currentCartItem.cartId
              ? { ...item, quantity: newQuantity }
              : item
          );
      
      setCartItems(updatedCart);

      try {
        const response = await updateCartItem(currentCartItem.cartId, {
          quantity: newQuantity,
        });

        if (!response?.success && 
            !response?.msg?.includes('updated') && 
            !response?.msg?.includes('removed')) {
          throw new Error(response?.msg || 'Failed to update cart');
        }

        toast.info(
          newQuantity > 0 ? 'Quantity updated' : 'Item removed from cart',
          { autoClose: 1500 }
        );
      } catch (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update cart quantity.');
        setCartItems(originalCart); // Rollback
      } finally {
        setIsCartActionLoading(false);
      }
    },
    [isLoggedIn, cartItems]
  );

  const handleAddToCart = useCallback(async () => {
      // ... (logic remains the same)
      if (!foodItem) return;

      if (!isLoggedIn) {
        addToLocalCart(foodItem);
        toast.success(`${foodItem.name} added to local cart!`);
        return;
      }

      const existingCartItem = getCartItem();
      if (existingCartItem) {
        await handleUpdateQuantity(existingCartItem, existingCartItem.quantity + 1);
        return;
      }

      setIsCartActionLoading(true);
      try {
        const response = await addToCart(foodItem._id);
        
        if (response?.status === true && response.data?._id) {
          setCartItems((prevCart) => [
            ...prevCart,
            { ...foodItem, quantity: 1, cartId: response.data._id },
          ]);
          toast.success(`${foodItem.name} added to cart!`);
        } else {
          throw new Error(response?.msg || 'Failed to add item');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error(`Failed to add ${foodItem.name} to cart.`);
      } finally {
        setIsCartActionLoading(false);
      }
  }, [foodItem, isLoggedIn, getCartItem, handleUpdateQuantity, cartItems]); // Updated dependency

  const increaseQuantity = useCallback(() => {
    const currentCartItem = getCartItem();
    if (currentCartItem) {
      handleUpdateQuantity(currentCartItem, currentCartItem.quantity + 1);
    }
  }, [getCartItem, handleUpdateQuantity]);

  const decreaseQuantity = useCallback(() => {
    const currentCartItem = getCartItem();
    if (currentCartItem) {
      handleUpdateQuantity(currentCartItem, currentCartItem.quantity - 1);
    }
  }, [getCartItem, handleUpdateQuantity]);

  // ===================
  // Render Helpers
  // ===================

  const renderBackButton = () => (
    <button
      onClick={() => navigate(-1)}
      className="mb-6 flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1 font-medium text-gray-800 transition-colors hover:bg-gray-200"
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );

  // --- UPDATED RENDER HELPER ---
  const renderFoodImageAndButton = (currentCartItem) => (
    <div className="flex flex-col items-center"> {/* Container to center items */}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg mb-6"> {/* Added margin-bottom */}
        <img
          src={foodItem.image || PLACEHOLDER_IMAGE}
          alt={foodItem.name}
          // --- FIXED IMAGE SIZE ---
          className="h-80 w-80 md:h-96 md:w-96 object-cover aspect-square"
          // --- END FIXED IMAGE SIZE ---
        />
      </div>
       {/* --- MOVED BUTTON RENDERING HERE --- */}
       <div className="w-full max-w-xs"> {/* Control button width */}
        {currentCartItem
          ? renderQuantityControl(currentCartItem)
          : renderAddToCartButton()}
      </div>
       {/* --- END MOVED BUTTON --- */}
    </div>
  );
  // --- END UPDATED HELPER ---

  const renderFoodInfo = () => (
    // ... (content remains the same)
    <>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {foodItem.restaurantId?.restaurantsName || 'Unknown Restaurant'}
      </span>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
        {foodItem.name}
      </h1>
      <p className="mt-3 text-2xl font-bold text-gray-900">
        ₹{foodItem.price?.toFixed(2)}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {foodItem.description || 'No description available.'}
      </p>
    </>
  );

  const renderTags = () => (
    // ... (content remains the same)
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
      {foodItem.category && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
          <span className="text-sm">🍽️</span>
          {foodItem.category}
        </span>
      )}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
          foodItem.isAvailable
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}
      >
        <span className="text-sm">{foodItem.isAvailable ? '✓' : '✕'}</span>
        {foodItem.isAvailable ? 'Available' : 'Unavailable'}
      </span>
    </div>
  );

  const renderRestaurantInfo = () => {
    // ... (content remains the same)
      if (!foodItem.restaurantId) return null;

    const restaurant = foodItem.restaurantId;

    return (
      <div className="mt-6 space-y-4 border-t pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Restaurant Details
        </h2>
        
        {/* Restaurant Name */}
        <div>
          <p className="text-sm font-semibold text-gray-900 capitalize">
            {restaurant.restaurantsName?.replace(/_/g, ' ') || 'Unknown Restaurant'}
          </p>

          {/* Description */}
          {restaurant.description && (
            <p className="mt-1 text-xs text-gray-600 capitalize">
              {restaurant.description}
            </p>
          )}
        </div>

        {/* Address */}
        {restaurant.address && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" /> {/* Single color */}
            <span className="capitalize">
              {restaurant.address.street && `${restaurant.address.street}, `}
              {restaurant.address.city}
            </span>
          </div>
        )}

        {/* Contact Info */}
        {restaurant.contact && (
          <div className="space-y-1.5 rounded-lg bg-gray-50 p-3 text-xs">
            {restaurant.contact.phone && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📞</span>
                <a 
                  href={`tel:${restaurant.contact.phone}`}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  {restaurant.contact.phone}
                </a>
              </div>
            )}
            {restaurant.contact.email && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">✉️</span>
                <a 
                  href={`mailto:${restaurant.contact.email}`}
                  className="text-gray-700 hover:text-red-600 transition-colors lowercase"
                >
                  {restaurant.contact.email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Cuisine and Rating */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Cuisine */}
          {restaurant.cuisine && restaurant.cuisine.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Cuisine:</span>
              <div className="flex flex-wrap gap-1.5">
                {restaurant.cuisine.map((item, index) => (
                  <span 
                    key={index}
                    className="inline-block rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 capitalize border border-orange-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

        
        </div>
      </div>
    );
  };

  const renderOffers = () => (
    // --- UPDATED HELPER --- (Smaller, no box)
    <div className="mt-6 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Available Offers
      </h2>
      {/* Increased spacing between items since the boxes are gone */}
      <div className="space-y-3"> 
        {AVAILABLE_OFFERS.map((offer) => {
          const IconComponent = offer.icon; // Get the component from the object
          return (
            <div
              key={offer.id}
              // --- REMOVED BOX STYLES ---
              className="flex items-start gap-3" 
            >
              {/* --- SMALLER ICON BACKGROUND --- */}
              <span className="flex-shrink-0 rounded-full bg-red-50 p-1.5"> 
                <IconComponent className="h-4 w-4 text-red-600" />
              </span>

              <div className="flex-1">
                {/* --- SMALLER FONT (TITLE) --- */}
                <h3 className="text-xs font-semibold text-gray-900"> 
                  {offer.title}
                </h3>
                <p className="mt-0.5 text-xs text-gray-600">
                  {offer.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- UPDATED RENDER HELPER --- (Icons use text-white)
  const renderQuantityControl = (currentCartItem) => (
    <div className="flex items-center justify-center gap-3"> {/* Centered */}
      <div className="flex items-center justify-center space-x-2.5 rounded-lg bg-red-500 px-3 py-2 shadow-md">
        <button
          onClick={decreaseQuantity}
          disabled={isCartActionLoading}
          className="rounded-full p-0.5 text-white transition-colors hover:bg-red-600 disabled:opacity-50" // text-white
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          className="min-w-[20px] text-center text-lg font-semibold text-white" // text-white
          aria-live="polite"
        >
          {isCartActionLoading ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          ) : (
            currentCartItem.quantity
          )}
        </span>
        <button
          onClick={increaseQuantity}
          disabled={isCartActionLoading}
          className="rounded-full p-0.5 text-white transition-colors hover:bg-red-600 disabled:opacity-50" // text-white
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <span className="text-xs text-gray-500">In Cart</span>
    </div>
  );
  // --- END UPDATED HELPER ---

  // --- UPDATED RENDER HELPER --- (Icons use text-white)
  const renderAddToCartButton = () => (
    <button
      onClick={handleAddToCart}
      disabled={!foodItem.isAvailable || isCartActionLoading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-200 ${ // text-white
        foodItem.isAvailable
          ? 'bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
          : 'cursor-not-allowed bg-gray-400'
      } disabled:cursor-not-allowed disabled:bg-gray-400`}
      aria-label={foodItem.isAvailable ? 'Add to cart' : 'Item unavailable'}
    >
      {isCartActionLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      <span>
        {isCartActionLoading
          ? 'Adding...'
          : foodItem.isAvailable
          ? 'Add to Cart'
          : 'Unavailable'}
      </span>
    </button>
  );
  // --- END UPDATED HELPER ---

  // ===================
  // Main Render
  // ===================

  if (isLoading) {
    // ... (loading state remains the same)
     return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    );
  }

  if (error || !foodItem) {
    // ... (error state remains the same)
      return (
      <>
        <Navigation />
        <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50 p-4">
          <AlertCircle className="h-16 w-16 text-red-400" />
          <p className="mt-4 text-center text-lg text-red-600">
            {error || 'Food item data could not be loaded.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </>
    );
  }

  const currentCartItem = getCartItem();

  return (
    <>
      <Navigation />
      <ToastContainer {...TOAST_CONFIG} />
      
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-4xl p-4 py-8">
          {renderBackButton()}

          {/* --- UPDATED GRID STRUCTURE --- */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            {/* Column 1: Image and Action Button */}
            <div className="flex flex-col items-center">
              {renderFoodImageAndButton(currentCartItem)}
            </div>

            {/* Column 2: Details */}
            <div className="flex flex-col justify-start space-y-6"> {/* Use justify-start */}
              {renderFoodInfo()}
              {renderTags()}
              {renderOffers()}
              {renderRestaurantInfo()}
            </div>
          </div>
           {/* --- END UPDATED STRUCTURE --- */}
        </main>
      </div>
    </>
  );
};