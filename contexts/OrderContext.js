'use client';

import React, { createContext, useState, useEffect } from 'react';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const orderKey = 'currentOrder';
  const [order, setOrder] = useState(null); // Initialize to null

  // Load order from localStorage on initial render
  useEffect(() => {
    const orderData = localStorage.getItem(orderKey);
    setOrder(orderData ? JSON.parse(orderData) : []);
  }, []);

  // Save order to localStorage whenever it changes, but only after loading
  useEffect(() => {
    if (order !== null) {
      localStorage.setItem(orderKey, JSON.stringify(order));
    }
  }, [order]);

  // Define methods to modify the order
  const addItem = (item) => {
    setOrder((prevOrder) => {
      const existingItem = prevOrder.find((i) => i.id === item.id);
      if (existingItem) {
        return prevOrder.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevOrder, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItem = (itemId) => {
    setOrder((prevOrder) => prevOrder.filter((item) => item.id !== itemId));
  };

  const clearOrder = () => {
    setOrder([]);
    localStorage.removeItem(orderKey);
  };

  const submitOrder = async (tableNumber, comments, selectedOptions, customerId) => {
    try {
      const orderData = order.map((item) => ({
        ...item,
        comment: comments[item.id] || null,
        selectedOptionId: selectedOptions[item.id] || null,
      }));

      const response = await fetch('/api/submitOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems: orderData,
          tableNumber,
          customerId, // Include customerId here
        }),
      });
      const data = await response.json();
      console.log('Order submitted:', data);
      clearOrder();
      return data; // Return the response data
    } catch (error) {
      console.error('Submission error:', error);
      throw error; // Re-throw error to be handled by the caller
    }
  };

  // Wait until order is loaded before rendering children
  if (order === null) {
    return null; // Or a loading indicator
  }

  return (
    <OrderContext.Provider
      value={{ order, addItem, removeItem, clearOrder, submitOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
};
