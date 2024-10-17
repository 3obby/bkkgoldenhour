'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const menuId = 1; // Replace with logic to select the active menu

  useEffect(() => {
    async function fetchMenuItems() {
      const response = await fetch(`/api/admin/menus/${menuId}`);
      const data = await response.json();
      console.log('Menu Data:', data); // Log the entire response
      setMenuItems(data.menuItems);
    }
    fetchMenuItems();
  }, [menuId]);

  const addToOrder = (item) => {
    // Logic to add item to the user's order (e.g., update local storage or context)
  };

  return (
    <div className="menu-page">
      <Link href="/checkout">
        <button className="button">View Order</button>
      </Link>

      <Link href="/adminportal">
        <button className="button admin-button">Admin Portal</button>
      </Link>
      <h1 className="title">Menu</h1>
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.id} className="menu-item">
            <img src={item.imageUrl} alt={item.name} width={150} className="item-image" />
            <h2 className="item-name">{item.name}</h2>
            <p className="item-description">{item.description}</p>
            <p className="item-price">${item.price.toFixed(2)}</p>
            <button onClick={() => addToOrder(item)} className="button">
              Add to Order
            </button>
          </li>
        ))}
      </ul>
      
    </div>
  );
}
