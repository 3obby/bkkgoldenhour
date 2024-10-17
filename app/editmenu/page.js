'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditMenu() {
  const [menu, setMenu] = useState(null);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);
  const [error, setError] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = searchParams.get('id');

  useEffect(() => {
    if (menuId) {
      // Fetch the menu details
      async function fetchMenu() {
        try {
          const response = await fetch(`/api/admin/menus/${menuId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch menu');
          }
          const data = await response.json();
          setMenu(data);
          setSelectedMenuItemIds(data.menuItems?.map((item) => item.id) || []);
        } catch (err) {
          console.error('Error fetching menu:', err);
          setError('Failed to load menu. Please try again.');
        }
      }

      fetchMenu();
    }
    // Fetch all menu items
    async function fetchAllMenuItems() {
      try {
        const response = await fetch('/api/admin/menuitems');
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        setAllMenuItems(data);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again.');
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
    <div className="edit-menu">
      {error && <p className="error">{error}</p>}
      {!error && !menu && <p className="loading">Loading Menu...</p>}
      {menu && (
        <>
          <h1 className="title">Edit Menu: {menu.name}</h1>

          {/* Select Menu Items */}
          <h2 className="subtitle">Select Menu Items</h2>
          {allMenuItems.length === 0 ? (
            <p>No menu items available. Please create some menu items first.</p>
          ) : (
            <ul className="menu-items-list">
              {allMenuItems.map((item) => (
                <li key={item.id} className="menu-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedMenuItemIds.includes(item.id)}
                      onChange={() => handleMenuItemToggle(item.id)}
                      className="checkbox"
                    />
                    {item.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleSaveMenu} className="button">
            Save Menu
          </button>
        </>
      )}
    </div>
  );
}
