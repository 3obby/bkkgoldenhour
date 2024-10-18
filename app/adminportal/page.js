'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image component from Next.js

export default function AdminPortal() {
  const [menus, setMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuName, setNewMenuName] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchMenus() {
      const response = await fetch('/api/admin/menus');
      const data = await response.json();
      setMenus(data);
    }
    async function fetchMenuItems() {
      const response = await fetch('/api/admin/menuitems');
      const data = await response.json();
      setMenuItems(data);
    }
    fetchMenus();
    fetchMenuItems();
  }, []);

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/admin/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMenuName }),
    });
    if (response.ok) {
      const newMenu = await response.json();
      setMenus((prevMenus) => [...prevMenus, newMenu]);
      setNewMenuName('');
    }
  };

  const handleEditMenu = (menuId) => {
    router.push(`/editmenu?id=${menuId}`);
  };

  const handleAddItem = () => {
    router.push('/edititem');
  };

  // Function to handle editing an item
  const handleEditItem = (itemId) => {
    router.push(`/edititem?id=${itemId}`);
  };

  return (
    <div className="admin-portal">
      <h1 className="title">Admin Portal</h1>

      {/* Create New Menu */}
      <form onSubmit={handleCreateMenu} className="create-menu-form">
        <input
          type="text"
          placeholder="New Menu Name"
          value={newMenuName}
          onChange={(e) => setNewMenuName(e.target.value)}
          required
          className="input-text"
        />
        <button type="submit" className="button">
          Create New Menu
        </button>
      </form>

      {/* List of Menus */}
      <h2 className="subtitle">Menus</h2>
      <ul className="menu-list">
        {menus.map((menu) => (
          <li key={menu.id} className="menu-item">
            <h3 className="menu-name">{menu.name}</h3>
            <button
              onClick={() => handleEditMenu(menu.id)}
              className="button edit-button"
            >
              Edit Menu
            </button>
          </li>
        ))}
      </ul>

      {/* List of Menu Items */}
      <h2 className="subtitle">Menu Items</h2>
      <ul className="menu-item-list">
        {menuItems.map((item) => (
          <li key={item.id} className="menu-item">
            <div className="item-content">
              {/* Image on the left */}
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={100}
                height={100}
                className="item-image"
              />
              {/* Details on the right */}
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-price">${item.price.toFixed(2)}</p>
                <button
                  onClick={() => handleEditItem(item.id)}
                  className="button edit-button"
                >
                  Edit Item
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={handleAddItem} className="button">
        Add New Menu Item
      </button>
    </div>
  );
}
