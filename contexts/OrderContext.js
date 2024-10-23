'use client';

import React, { createContext, useState, useEffect } from 'react';

export const OrderContext = createContext();

export function OrderProvider({ children }) {
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

  const submitOrder = async (
    tableNumber,
    comments,
    selectedOptions,
    customerId,
    coordinates
  ) => {
    try {
      const orderData = {
        customerId,
        x: parseFloat(coordinates?.x || 0),
        z: parseFloat(coordinates?.z || 0),
        orderItems: order.map((item) => ({
          menuItemId: item.id, // Ensure menuItemId is set correctly
          quantity: item.quantity,
          comment: comments[item.id] || null,
          selectedOptionId: selectedOptions[item.id] || null,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Order submitted:', data);
      clearOrder();
      return data;
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  };

  // Wait until order is loaded before rendering children
  if (order === null) {
    return null; // Or a loading indicator
  }

  return (
    <OrderContext.Provider
      value={{
        order,
        setOrder,
        addItem,
        removeItem,
        submitOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
