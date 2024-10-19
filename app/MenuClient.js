'use client';

import { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderContext } from '../contexts/OrderContext';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function MenuClient({ categories, initialMenuItems }) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { order, addItem } = useContext(OrderContext);
  const router = useRouter();

  // State and references for icon animation
  const [iconIndex, setIconIndex] = useState(0);
  const icons = ['🥩', '🍟', '🍻', '🍰', '🍹', '🍗', '🐔', '🥖', '🦐', '🍤', '🥔', '🍠', '🧆', '🍝', '🐟', '🍔', '🍲', '🥭', '🟫', '🍸', '🥃', '🏺', '🍹', '💨'];
  const timeoutRef = useRef(null);

  // Fetch menu items when selectedCategory changes
  useEffect(() => {
    async function fetchMenuItemsByCategory() {
      try {
        const url = selectedCategory
          ? `/api/admin/menuitems?category=${encodeURIComponent(selectedCategory)}`
          : `/api/admin/menuitems`;
        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          console.error('Invalid menu data structure:', data);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    }

    if (selectedCategory !== '') {
      fetchMenuItemsByCategory();
    } else {
      setMenuItems(initialMenuItems);
    }
  }, [selectedCategory]);

  // Calculate total quantity in the order
  const orderCount = order.reduce((total, item) => total + item.quantity, 0);

  // Implement handleAddToOrder function
  const handleAddToOrder = (item) => {
    addItem(item);
  };

  useEffect(() => {
    let isMounted = true;

    function updateIcon() {
      if (!isMounted) return;

      // Update icon index
      setIconIndex((prevIndex) => (prevIndex + 1) % icons.length);

      // Calculate new delay for cyclic timing (fast to slow to fast)
      const maxDelay = 300; // Maximum delay in ms
      const minDelay = 3;  // Minimum delay in ms
      const period = 5000;   // Full cycle period in ms
      const time = Date.now() % period;
      const sineValue = Math.sin((2 * Math.PI * time) / period); // Ranges from -1 to 1
      const newDelay = minDelay + ((maxDelay - minDelay) * (1 - sineValue) / 2);

      // Schedule next update
      timeoutRef.current = setTimeout(updateIcon, newDelay);
    }

    // Start the animation
    timeoutRef.current = setTimeout(updateIcon, 200); // Initial delay

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useLayoutEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, [orderCount]); // Recalculate if navbar height might change

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'Rubik';
          src: url('/fonts/Rubik-VariableFont_wght.ttf') format('truetype');
          font-weight: 100 900;
          font-style: normal;
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar" ref={navbarRef}>
        {/* Logo Section */}
        <div className="logo-container">
        <div className="category-filter matrix-style">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-category"
              >
                <option value="">
                ▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;¯\_(ツ)_/¯{icons[iconIndex]}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
        </div>
        {/* View Order Button */}
        {orderCount > 0 && (
          <div className="order-button-container">
            <Link href="/checkout">
              <button className="cart-button">
                <div className="cart-icon-wrapper" style={{ position: 'relative' }}>
                  <Image
                    src="/images/shopping-cart.png"
                    alt="Shopping Cart"
                    width={50}
                    height={50}
                    className="cart-icon"
                  />
                  <span
                    className="order-count"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      color: 'gold',
                      borderRadius: '50%',
                      fontSize: '24px',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textShadow:
                        '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
                    }}
                  >
                    {orderCount}
                  </span>
                </div>
              </button>
            </Link>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <div className="menu-page" style={{ paddingTop: '20px' }}>
        {/* Content wrapper */}
        <div className="content-wrapper" style={{ paddingTop: navbarHeight }}>
          {/* Menu Items */}
          {menuItems && menuItems.length > 0 ? (
            <ul className="menu-list">
              {menuItems.map((item) => (
                <li key={item.id} className="menu-item" style={{ padding: '20px' }}>
                  <div >
                    {/* Image Container */}
                    <div className="image-container">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={600}
                        height={600}
                        className="item-image" // Added className for styling
                      />
                      {/* Item Name Overlay */}
                      <h1 className="item-name" style={{
                       
                        top: '10%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        textAlign: 'center'
                      }}>{item.name}</h1>
                    </div>
                   
                    {/* Footer with Price and Add Button */}
                    <div className="item-footer" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      
                      <div className="item-description" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '100%' }}>
                        <p style={{ textAlign: 'center', width: '100%' }}>{item.description}</p>
                      </div>
                      <div className="item-price-container">
                        <p className="item-price" style={{ fontSize: '1.2em' }}>{item.price}฿</p>
                        <button 
                            // Start of Selection
                            onClick={() => handleAddToOrder(item)}
                            className="add-button centered-button"
                      >
                        ➕
                      </button>
                      </div>
                      
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No menu items available.</p>
          )}
        </div>
      </div>
    </>
  );
}
// No code needed at this insertion point.
