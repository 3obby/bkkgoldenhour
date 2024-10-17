'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditMenu() {
  const [menu, setMenu] = useState(null);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = searchParams.get('id');

  useEffect(() => {
    if (menuId) {
      // Fetch the menu details
      async function fetchMenu() {
        const response = await fetch(`/api/admin/menus/${menuId}`);
        if (response.ok) {
          const data = await response.json();
          setMenu(data);
          setSelectedMenuItemIds(data.menuItems.map((item) => item.id));
        }
      }

      fetchMenu();
    }
    // Fetch all menu items
    async function fetchAllMenuItems() {
      const response = await fetch('/api/admin/menuitems');
      if (response.ok) {
        const data = await response.json();
        setAllMenuItems(data);
      }
    }
    fetchAllMenuItems();
  }, [menuId]);

  const handleMenuItemToggle = (menuItemId) => {
    setSelectedMenuItemIds((prevIds) =>
      prevIds.includes(menuItemId)
        ? prevIds.filter((id) => id !== menuItemId)
        : [...prevIds, menuItemId]
    );
  };

  const handleSaveMenu = async () => {
    const response = await fetch(`/api/admin/menus/${menuId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemIds: selectedMenuItemIds }),
    });
    if (response.ok) {
      const updatedMenu = await response.json();
      setMenu(updatedMenu);
      alert('Menu updated successfully');
    } else {
      alert('Failed to update menu');
    }
  };

  return (
    <div>
      {menu ? (
        <>
          <h1>Edit Menu: {menu.name}</h1>

          {/* Select Menu Items */}
          <h2>Select Menu Items</h2>
          <ul>
            {allMenuItems.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMenuItemIds.includes(item.id)}
                    onChange={() => handleMenuItemToggle(item.id)}
                  />
                  {item.name}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleSaveMenu}>Save Menu</button>
        </>
      ) : (
        <p>Loading Menu...</p>
      )}
    </div>
  );
}
