'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderContext } from '../contexts/OrderContext';
import { useRouter } from 'next/navigation';

export default function MenuClient({ categories, initialMenuItems }) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { order, addItem } = useContext(OrderContext);
  const router = useRouter();

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

  return (
    <div className="menu-page">
      {/* Navbar */}
      <nav className="navbar">
        
        <Image
  src="/images/euphoria.avif"
  alt="Euphoria Logo"
  width={200}
  height={50}
  priority={true}
  className="main-title"
  style={{ width: '200px', height: 'auto' }}
/>
        <Link href="/checkout">
          <button className="button view-order-button">View Order ({orderCount})</button>
        </Link>
      </nav>

      <h1 className="title">Menu</h1>

      {/* Category Filter */}
      <div className="category-filter">
        <label htmlFor="category-select">Filter by Category:</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select-category"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      {menuItems && menuItems.length > 0 ? (
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.id} className="menu-item">
              <div className="item-content">
                {/* Image */}
                <Image
  src={item.imageUrl}
  alt={item.name}
  width={150}
  height={150}
  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
/>
                {/* Details */}
                <div className="item-details">
                  <h2 className="item-name">{item.name}</h2>
                  <p className="item-description">{item.description}</p>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  <div className="item-buttons">
                    <button onClick={() => handleAddToOrder(item)} className="button">
                      Add to Order
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
  );
}
