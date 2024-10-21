'use client';

import { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderContext } from '../contexts/OrderContext';
import { useRouter } from 'next/navigation';
import React from 'react';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import EmojiIcon from './components/EmojiIcon'; // Updated import path

export default function MenuClient({ categories, initialMenuItems }) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { order, addItem } = useContext(OrderContext);
  const router = useRouter();

  // State and references for icon animation
  const [iconIndex, setIconIndex] = useState(0);
  const icons = ['🥩', '🍟', '🍻', '🍰', '🍹', '🍗', '🐔', '🥖', '🦐', '🍤', '🥔', '🍠', '🧆', '🍝', '🐟', '🍔', '🍲', '🥭', '🟫', '🍸', '🥃', '🏺', '🍹', '💨'];
  const timeoutRef = useRef(null);

  // State for the button click effect
  const [clickedButtons, setClickedButtons] = useState([]);

  // **New state to control background glow**
  const [showBackgroundGlow, setShowBackgroundGlow] = useState(false);

  // State for cart icon animation
  const [cartIconAnimationKey, setCartIconAnimationKey] = useState(0);

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

  // Implement handleAddToOrder function with animation
  const handleAddToOrder = (item, event) => {
    addItem(item);
  
    // Increment the animation key to trigger re-render
    setCartIconAnimationKey((prevKey) => prevKey + 1);

    // **Check if the order was previously empty**
    const wasEmpty = orderCount === 0;

    // **If the cart was empty, show the background glow**
    if (wasEmpty) {
      setShowBackgroundGlow(true);

      // Optionally remove the glow after some time
      setTimeout(() => {
        setShowBackgroundGlow(false);
      }, 2000); // Adjust duration as needed
    }

    // Get the button element
    const button = event.currentTarget;

    // Add the 'clicked' class to trigger animation
    button.classList.add('clicked');

    // Remove the 'clicked' class after the animation ends
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 200); // Duration matches the CSS animation duration

    // Get the button's position
    const rect = button.getBoundingClientRect();
    const id = Date.now() + Math.random(); // Unique ID for each effect

    // Randomize xDistance between -400px (left) and 400px (right)
    const xDistance = Math.random() * 800 - 400;

    // Reduce animation duration to be between 800ms and 1200ms
    const speed = Math.random() * 400 + 800; // between 800ms and 1200ms

    // Random initial rotation angle between 0 and 360 degrees
    const initialRotation = Math.random() * 360;

    // Random initial scale between 0.8 and 1.2
    const initialScale = 0.8 + Math.random() * 0.4;

    // Use the same emoji as in EmojiIcon
    const currentIcon = icons[iconIndex];

    // Add the effect to the array
    setClickedButtons((prev) => [
      ...prev,
      {
        id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        xDistance,
        speed,
        icon: currentIcon,
        initialRotation,
        initialScale,
      },
    ]);

    // Remove the effect after the animation duration
    setTimeout(() => {
      setClickedButtons((prev) => prev.filter((effect) => effect.id !== id));
    }, speed);
  };

  useEffect(() => {
    let isMounted = true;

    function updateIcon() {
      if (!isMounted) return;

      // Update icon index
      setIconIndex((prevIndex) => (prevIndex + 1) % icons.length);

      // Calculate new delay for cyclic timing (fast to slow to fast)
      const maxDelay = 300; // Maximum delay in ms
      const minDelay = 3;   // Minimum delay in ms
      const period = 5000;  // Full cycle period in ms
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

  const cartButtonRef = useRef(null);

  const handleCartButtonClick = (event) => {
    event.preventDefault(); // Prevent default navigation

    // Add 'clicked' class to trigger animation
    if (cartButtonRef.current) {
      cartButtonRef.current.classList.add('clicked');

      // Remove the 'clicked' class after the animation ends
      setTimeout(() => {
        cartButtonRef.current.classList.remove('clicked');
        // Navigate to the checkout page after animation
        router.push('/checkout');
      }, 500); // Duration matches the CSS animation duration
    }
  };

  return (
    <>
      <BackgroundCanvas />
      <style jsx global>{`
        @font-face {
          font-family: 'Rubik';
          src: url('/fonts/Rubik-VariableFont_wght.ttf') format('truetype');
          font-weight: 100 900;
          font-style: normal;
        }
      `}</style>

      {/* Wrap your content inside the content-container */}
      <div className="content-container">
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
                  ▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;¯\_(ツ)_/¯
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    ▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pass iconIndex and setIconIndex to EmojiIcon */}
            <EmojiIcon iconIndex={iconIndex} setIconIndex={setIconIndex} icons={icons} />

            {/* ... rest of logo-container if any ... */}
          </div>
          {/* View Order Button */}
          <div className="order-button-container">
            <button
              className="cart-button cart-button-responsive"
              ref={cartButtonRef}
              onClick={handleCartButtonClick}
            >
              <div
              key={cartIconAnimationKey}
                className={`cart-icon-wrapper cart-logo-background ${
                  cartIconAnimationKey ? 'animate-glow' : ''
                } ${orderCount > 0 ? 'items-in-cart' : ''}`}
              >
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
                    fontSize: '32px',
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
          </div>
        </nav>

        {/* Page Content */}
        <div className="menu-page">
          {/* Content wrapper */}
          <div className="content-wrapper" style={{ paddingTop: navbarHeight }}>
            {/* Menu Items */}
            {menuItems && menuItems.length > 0 ? (
              <ul className="menu-list">
                {menuItems.map((item) => (
                  <li key={item.id} className="menu-item">
                    {/* Image Container */}
                    <div className="image-container">
                      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={600}
                            height={600}
                            className="item-image"
                            style={{ width: '100%', height: 'auto' }}
                          />
                          {/* Item Name Overlay */}
                          <h1
                            className="item-name"
                            style={{
                              position: 'absolute',
                              top: '10%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            {item.name}
                          </h1>
                        </div>
                      </div>

                      {/* Footer with Price and Add Button */}
                      <div
                        className="item-footer"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          transform: 'translateY(-50px)',
                        }}
                      >
                        <div
                          className="item-description"
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            height: '100%',
                          }}
                        >
                          <p style={{ textAlign: 'center', width: '100%' }}>{item.description}</p>
                        </div>
                        <div className="item-price-container">
                          <p className="item-price" style={{ fontSize: '1.2em' }}>
                            {item.price}฿
                          </p>
                          <button
                            onClick={(event) => handleAddToOrder(item, event)}
                            className="add-button centered-button"
                          >
                            +
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
      </div>

      {/* Render the button click effects */}
      {clickedButtons.map((effect) => (
        // Replace the div with a span to render the emoji icon
        <span
          key={effect.id}
          className="button-click-effect"
          style={{
            left: effect.x,
            top: effect.y,
            '--x-distance': `${effect.xDistance}px`,
            '--speed': `${effect.speed}ms`,
            '--initial-rotation': `${effect.initialRotation}deg`,
            '--initial-scale': effect.initialScale,
          }}
        >
          {effect.icon}
        </span>
      ))}
    </>
  );
}
