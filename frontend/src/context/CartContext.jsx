import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart items', e);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (course) => {
    if (cartItems.some((item) => item._id === course._id)) return;
    const updated = [...cartItems, course];
    saveCart(updated);
  };

  const removeFromCart = (courseId) => {
    const updated = cartItems.filter((item) => item._id !== courseId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
    setCouponError('');
  };

  const isInCart = (courseId) => {
    return cartItems.some((item) => item._id === courseId);
  };

  // Validate and apply coupon code
  const applyCoupon = async (code) => {
    if (!code) {
      setCoupon(null);
      setCouponError('');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/coupons/validate/${code}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setCoupon(data);
        setCouponError('');
        return { success: true };
      } else {
        setCoupon(null);
        setCouponError(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      setCoupon(null);
      setCouponError('Error de red al validar cupón.');
      return { success: false, message: 'Error de red.' };
    } finally {
      setCouponLoading(false);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = Math.max(subtotal - discountAmount, 0);

  // Complete checkout process
  const checkoutCart = async () => {
    if (cartItems.length === 0) return { success: false, message: 'El carrito está vacío' };
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'Debe iniciar sesión para realizar la compra' };

    try {
      const courseIds = cartItems.map((item) => item._id);
      const response = await fetch(`${API_URL}/purchases/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseIds,
          couponCode: coupon ? coupon.code : undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        clearCart();
        return { success: true, purchase: data.purchase };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Error de red al completar la compra.' };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        couponError,
        couponLoading,
        subtotal,
        discountAmount,
        total,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        applyCoupon,
        checkoutCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
