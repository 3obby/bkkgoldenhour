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
  const [showLogo, setShowLogo] = useState(true);

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
      const maxDelay = 1000; // Maximum delay in ms
      const minDelay = 200;  // Minimum delay in ms
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useLayoutEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, [showLogo, orderCount]); // Recalculate if navbar height might change

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
        {/* Logo Section or Category Filter */}
        <div className="logo-container">
          {showLogo ? (
            <Image
              src="/images/euphoria.avif"
              alt="Euphoria Logo"
              width={200}
              height={50}
              priority={true}
              className="main-title"
              style={{
                width: '200px',
                height: 'auto',
                filter: 'invert(39%) sepia(60%) saturate(2163%) hue-rotate(312deg) brightness(100%) contrast(101%)',
              }}
            />
          ) : (
            <div className="category-filter matrix-style">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-category"
              >
                <option value="">
                ▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;¯\_(ツ)_/¯{icons[iconIndex]}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
                <li key={item.id} className="menu-item">
                  <div className="item-content">
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
                      <h2 className="item-name">{item.name}</h2> {/* Moved inside image-container */}
                    </div>
                    {/* Description */}
                    <p className="item-description">{item.description}</p>
                    {/* Footer with Price and Add Button */}
                    <div className="item-footer">
                      <p className="item-price">${item.price.toFixed(2)}</p>
                      <button onClick={() => handleAddToOrder(item)} className="add-button">
                        ➕
                      </button>
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
