'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderContext } from '../contexts/OrderContext';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [menuName, setMenuName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const menuId = 2; // Replace with logic to select the active menu

  // Use the order context
  const { order, addItem } = useContext(OrderContext);

  useEffect(() => {
    async function fetchMenuItems() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/menus/${menuId}`);
        const data = await response.json();
        console.log('Menu Data:', data); // Log the entire response
        if (data && Array.isArray(data.menuItems)) {
          setMenuItems(data.menuItems);
          setMenuName(data.name || 'Menu');
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
  }, [menuId]);

  const handleAddToOrder = (item) => {
    addItem(item);
  };

  // Calculate total quantity in the order
  const orderCount = order.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="menu-page">
      <Link href="/checkout">
        <button className="button">View Order ({orderCount})</button>
      </Link>

      <Link href="/adminportal">
        <button className="button admin-button">Admin Portal</button>
      </Link>
      <h1 className="title">{menuName || 'Menu'}</h1>
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
    </div>
  );
}
