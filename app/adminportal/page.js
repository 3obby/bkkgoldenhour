'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  return (
    <div>
      <h1>Admin Portal</h1>

      {/* Create New Menu */}
      <form onSubmit={handleCreateMenu}>
        <input
          type="text"
          placeholder="New Menu Name"
          value={newMenuName}
          onChange={(e) => setNewMenuName(e.target.value)}
          required
        />
        <button type="submit">Create New Menu</button>
      </form>

      {/* List of Menus */}
      <h2>Menus</h2>
      <ul>
        {menus.map((menu) => (
          <li key={menu.id}>
            <h3>{menu.name}</h3>
            <button onClick={() => handleEditMenu(menu.id)}>Edit Menu</button>
          </li>
        ))}
      </ul>

      {/* List of Menu Items */}
      <h2>Menu Items</h2>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <h3>{item.name}</h3>
            {/* Add Edit functionality if desired */}
          </li>
        ))}
      </ul>
      <button onClick={handleAddItem}>Add New Menu Item</button>
    </div>
  );
}
