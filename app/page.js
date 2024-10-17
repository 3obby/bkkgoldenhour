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
      setMenuItems(data.menuItems);
    }
    fetchMenuItems();
  }, [menuId]);

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

      <Link href="/adminportal">
        <button>Admin Portal</button>
      </Link>
    </div>
  );
}
