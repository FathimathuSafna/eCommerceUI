
export const getLocalCart = () => {
  try {
    const cart = localStorage.getItem('guestCart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading local cart:', error);
    return [];
  }
};

/**
 * Save cart items to localStorage
 */
export const saveLocalCart = (cartItems) => {
  try {
    localStorage.setItem('guestCart', JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving local cart:', error);
  }
};

/**
 * Add item to localStorage cart
 */
export const addToLocalCart = (foodItem) => {
  const cart = getLocalCart();
  const existingItemIndex = cart.findIndex(item => item._id === foodItem._id);

  if (existingItemIndex > -1) {
    // Increase quantity if item exists
    cart[existingItemIndex].quantity += 1;
  } else {
    // Add new item with quantity 1
    cart.push({ ...foodItem, quantity: 1 });
  }

  saveLocalCart(cart);
  return cart;
};

/**
 * Remove item from localStorage cart
 */
export const removeFromLocalCart = (itemId) => {
  const cart = getLocalCart();
  const updatedCart = cart.filter(item => item._id !== itemId);
  saveLocalCart(updatedCart);
  return updatedCart;
};

/**
 * Update item quantity in localStorage cart
 */
export const updateLocalCartQuantity = (itemId, newQuantity) => {
  const cart = getLocalCart();
  const updatedCart = cart.map(item => 
    item._id === itemId ? { ...item, quantity: newQuantity } : item
  );
  saveLocalCart(updatedCart);
  return updatedCart;
};

/**
 * Clear localStorage cart
 */
export const clearLocalCart = () => {
  localStorage.removeItem('guestCart');
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = () => {
  return !!localStorage.getItem('token');
};