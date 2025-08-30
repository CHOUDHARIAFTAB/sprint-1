/* eslint-disable react-refresh/only-export-components */
// @ts-nocheck
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

// State shape: [ { _id, item: { _id, name, price, … }, quantity }, … ]
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE_CART':
      return action.payload;

    // This logic correctly handles both adding a NEW item 
    // and updating an EXISTING item's quantity.
    case 'ADD_ITEM':
    case 'UPDATE_ITEM': {
      const updatedItemFromServer = action.payload;
      const itemExists = state.find(ci => ci._id === updatedItemFromServer._id);

      if (itemExists) {
        // If item is already in the cart, map over the state and replace it with the updated version from the server.
        return state.map(cartItem =>
          cartItem._id === updatedItemFromServer._id ? updatedItemFromServer : cartItem
        );
      } else {
        // If the item is new, simply add it to the cart state.
        return [...state, updatedItemFromServer];
      }
    }

    case 'REMOVE_ITEM':
      return state.filter(ci => ci._id !== action.payload);

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

const initializer = () => {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [], initializer);

  // Persist locally
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Hydrate from server
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    axios
      .get('http://localhost:4000/api/cart', {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => dispatch({ type: 'HYDRATE_CART', payload: res.data }))
      .catch(err => { if (err.response?.status !== 401) console.error(err); });
  }, []);

 const addToCart = useCallback(async (item, qty) => {
    const token = localStorage.getItem('authToken');
    const res = await axios.post(
      'http://localhost:4000/api/cart',
      // THE FIX IS ON THIS LINE: change 'item._id' to 'item.id'
      { itemId: item.id, quantity: qty },
      { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch({ type: 'ADD_ITEM', payload: res.data });
  }, []);

  const updateQuantity = useCallback(async (_id, qty) => {
    const token = localStorage.getItem('authToken');
    const res = await axios.put(
      `http://localhost:4000/api/cart/${_id}`,
      { quantity: qty },
      { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
    );
    // backend responds with updated { _id, item, quantity }
    dispatch({ type: 'UPDATE_ITEM', payload: res.data });
  }, []);

  const removeFromCart = useCallback(async _id => {
    const token = localStorage.getItem('authToken');
    await axios.delete(
      `http://localhost:4000/api/cart/${_id}`,
      { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch({ type: 'REMOVE_ITEM', payload: _id });
  }, []);

  const clearCart = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    await axios.post(
      'http://localhost:4000/api/cart/clear',
      {},
      { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalAmount = cartItems.reduce((sum, ci) => {
    const price = ci?.item?.price ?? 0;
    const qty = ci?.quantity ?? 0;
    return sum + price * qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
