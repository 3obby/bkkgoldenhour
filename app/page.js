'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderContext } from '../contexts/OrderContext';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [menuName, setMenuName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const menuId = 2; // Replace with logic to select the active menu

  // Use the order context
  const { order, addItem } = useContext(OrderContext);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchMenuItems() {
      setIsLoading(true);
      try {
        const url = selectedCategory
          ? `/api/admin/menuitems?category=${encodeURIComponent(selectedCategory)}`
          : `/api/admin/menuitems`;
        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data)) {
          setMenuItems(data);
          setMenuName('Menu'); // You can adjust this as needed
        } else {
          console.error('Invalid menu data structure:', data);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenuItems();
  }, [selectedCategory]);

  const handleAddToOrder = (item) => {
    addItem(item);
  };

  // Calculate total quantity in the order
  const orderCount = order.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="menu-page">
      <nav className="navbar">
        <Link href="/adminportal">
          <button className="button admin-button">Admin Portal</button>
        </Link>
        <Image
          src="/images/euphoria.avif"
          alt="Euphoria Logo"
          width={200}
          height={50}
          className="main-title"
        />
        <Link href="/checkout">
          <button className="button view-order-button">View Order ({orderCount})</button>
        </Link>
      </nav>

      <h1 className="title">{menuName || 'Menu'}</h1>

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

      {menuItems && menuItems.length > 0 ? (
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.id} className="menu-item">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={150}
                height={150}
                className="item-image"
              />
              <h2 className="item-name">{item.name}</h2>
              <p className="item-description">{item.description}</p>
              <p className="item-price">${item.price.toFixed(2)}</p>
              <button onClick={() => handleAddToOrder(item)} className="button">
                Add to Order
              </button>
            </li>
          ))}
        </ul>
      ) : isLoading ? (
        <p>Loading menu items...</p>
      ) : (
        <p>No menu items available.</p>
      )}

      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #ff1379;
          padding: 10px 20px;
        }
        .navbar .main-title {
          flex-grow: 1;
          text-align: center;
          margin: 0;
        }
        .navbar .button {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
