'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    async function fetchMenuItems() {
      // Assume default menu ID is 1 or fetch the active menu
      const response = await fetch('/api/admin/menus/1/items');
      const data = await response.json();
      setMenuItems(data);
    }
    fetchMenuItems();
  }, []);

  const addToOrder = (item) => {
    // Logic to add item to the user's order (e.g., update local storage or context)
  };

  return (
    <div>
      <h1>Menu</h1>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <img src={item.imageUrl} alt={item.name} width={150} />
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p>${item.price.toFixed(2)}</p>
            <button onClick={() => addToOrder(item)}>Add to Order</button>
          </li>
        ))}
      </ul>
      <Link href="/checkout">
        <button>View Order</button>
      </Link>

      {/* Add this block to include the Admin Portal button */}
      <Link href="/adminportal">
        <button>Admin Portal</button>
      </Link>
    </div>
  );
}
