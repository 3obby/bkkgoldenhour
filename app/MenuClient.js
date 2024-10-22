'use client';

import { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderContext } from '../contexts/OrderContext';
import { useRouter } from 'next/navigation';
import React from 'react';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import EmojiIcon from './components/EmojiIcon';
import OrderModal from '../components/OrderModal';
import OrdersInfo from '../components/OrdersInfo'; // Import OrdersInfo component

// Custom hook to keep track of previous value
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function MenuClient({ categories, initialMenuItems }) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { order, addItem } = useContext(OrderContext);
  const router = useRouter();

  // Calculate total quantity in the order
  const orderCount = order.reduce((total, item) => total + item.quantity, 0);

  // Keep track of previous orderCount to detect when cart becomes empty
  const prevOrderCount = usePrevious(orderCount);

  // State and references for icon animation
  const [iconIndex, setIconIndex] = useState(0);
  const icons = ['🥩', '🍟', '🍻', '🍰', '🍹', '🍗', '🐔', '🦐', '🍤', '🥔', '🍠', '🧆', '🍝', '🐟', '🍔', '🍲', '🥭', '🟫', '🍸', '🥃', '🏺', '🍹', '💨'];
  const timeoutRef = useRef(null);

  // State for the button click effect
  const [clickedButtons, setClickedButtons] = useState([]);

  // State to control background glow
  const [showBackgroundGlow, setShowBackgroundGlow] = useState(false);

  // State for cart icon animation
  const [cartIconAnimationKey, setCartIconAnimationKey] = useState(0);

  // State variables to control modal visibility
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrdersInfoOpen, setIsOrdersInfoOpen] = useState(false);

  // State variable to control scroll burst effect
  const [showScrollBurst, setShowScrollBurst] = useState(false);

  // Add state to control the cart appearance animation
  const [showCartAppearanceAnimation, setShowCartAppearanceAnimation] = useState(false);

  // Detect when cart becomes empty to trigger burst effect
  useEffect(() => {
    if (prevOrderCount > 0 && orderCount === 0) {
      // Cart just became empty
      setShowScrollBurst(true);

      // Remove the burst effect after animation ends
      setTimeout(() => {
        setShowScrollBurst(false);
      }, 1000); // Match the duration of the burstEffectAnimation
    }
  }, [orderCount, prevOrderCount]);

  // Detect when cart becomes non-empty to trigger appearance animation
  useEffect(() => {
    if (prevOrderCount === 0 && orderCount > 0) {
      // Cart just became non-empty
      setShowCartAppearanceAnimation(true);

      // Remove the appearance animation class after the animation ends
      setTimeout(() => {
        setShowCartAppearanceAnimation(false);
      }, 1000); // Match the duration of the animation
    }
  }, [orderCount, prevOrderCount]);

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

  // Implement handleAddToOrder function with animation
  const handleAddToOrder = (item, event) => {
    addItem(item);

    // Increment the animation key to trigger re-render
    setCartIconAnimationKey((prevKey) => prevKey + 1);

    // Check if the order was previously empty
    const wasEmpty = orderCount === 0;

    // If the cart was empty, show the background glow
    if (wasEmpty) {
      setShowBackgroundGlow(true);

      // Optionally remove the glow after some time
      setTimeout(() => {
        setShowBackgroundGlow(false);
      }, 2000); // Adjust duration as needed
    }

    // Get the button element
    const button = event.currentTarget;

    // Remove the 'clicked' class to reset the animation
    button.classList.remove('clicked');

    // Force a reflow to restart the animation
    void button.offsetWidth;

    // Add the 'clicked' and 'glow-visible' classes to trigger animations
    button.classList.add('clicked', 'glow-visible');

    // Remove the 'glow-visible' class after the animation ends
    setTimeout(() => {
      button.classList.remove('glow-visible');
    }, 500); // Adjust duration as needed

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
      setClickedButtons((prev) =>
        prev.filter((effect) => effect.id !== id)
      );
    }, speed);
  };

  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useLayoutEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, [orderCount]); // Recalculate if navbar height might change

  const cartButtonRef = useRef(null);

  const handleCartButtonClick = (event) => {
    event.preventDefault();

    if (cartButtonRef.current) {
      cartButtonRef.current.classList.add('clicked');

      setTimeout(() => {
        cartButtonRef.current.classList.remove('clicked');

        if (order.length > 0) {
          // Open OrderModal if cart is not empty
          setIsOrderModalOpen(true);
        } else {
          // Open OrdersInfo modal if cart is empty
          setIsOrdersInfoOpen(true);
        }
      }, 500);
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
          {/* Left Section */}
          <div className="navbar-left">
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

            {/* Emoji Icon */}
            <EmojiIcon
              iconIndex={iconIndex}
              setIconIndex={setIconIndex}
              icons={icons}
            />
          </div>

          {/* Right Section */}
          <div className="navbar-right">
            <button
              className="cart-button cart-button-responsive"
              ref={cartButtonRef}
              onClick={handleCartButtonClick}
              style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}
            >
              {/* Only display order count when orderCount > 0 */}
              {orderCount > 0 && (
                <span className="order-count">{orderCount}</span>
              )}

              <div
                key={cartIconAnimationKey}
                className={`${
                  orderCount > 0
                    ? `cart-icon-wrapper cart-logo-background ${showCartAppearanceAnimation ? 'cart-appearance-animation' : ''}`
                    : 'scroll-icon-wrapper'
                } ${cartIconAnimationKey ? 'animate-glow' : ''} ${
                  orderCount > 0 ? 'items-in-cart' : ''
                } ${
                  showScrollBurst && orderCount === 0 ? 'burst-effect' : ''
                }`}
              >
                <Image
                  src={
                    orderCount > 0
                      ? '/images/shopping-cart.png' // Cart image when items are in the cart
                      : '/images/scroll.png' // Scroll image when cart is empty
                  }
                  alt="Cart Icon"
                  width={50}
                  height={50}
                  className={orderCount > 0 ? 'cart-icon' : 'scroll-icon'}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="menu-page">
          {/* Content wrapper */}
          <div
            className="content-wrapper"
            style={{ paddingTop: navbarHeight }}
          >
            {/* Menu Items */}
            {menuItems && menuItems.length > 0 ? (
              <ul className="menu-list">
                {menuItems.map((item) => (
                  <li key={item.id} className="menu-item">
                    {/* Image Container */}
                    <div className="image-container">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '600px',
                          }}
                        >
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
                      <div className="item-footer">
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
                          <p
                            style={{
                              textAlign: 'center',
                              width: '100%',
                            }}
                          >
                            {item.description}
                          </p>
                        </div>
                        <div className="item-price-container">
                          <p className="item-price">{item.price}฿</p>
                          <button
                            onClick={(event) =>
                              handleAddToOrder(item, event)
                            }
                            className="add-button centered-button add-button-large add-button-glow"
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

      {/* Render the OrderModal */}
      {isOrderModalOpen && (
        <OrderModal onClose={() => setIsOrderModalOpen(false)} />
      )}

      {/* Render the OrdersInfo modal */}
      {isOrdersInfoOpen && (
        <OrdersInfo onClose={() => setIsOrdersInfoOpen(false)} />
      )}
    </>
  );
}
