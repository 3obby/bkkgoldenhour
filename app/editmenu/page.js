'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditMenu() {
  const [menu, setMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = searchParams.get('id');

  useEffect(() => {
    if (menuId) {
      // Fetch the menu details
      async function fetchMenu() {
        const response = await fetch(`/api/admin/menus/${menuId}`);
        const data = await response.json();
        setMenu(data);
      }
      // Fetch menu items
      async function fetchMenuItems() {
        const response = await fetch(`/api/admin/menus/${menuId}/items`);
        const data = await response.json();
        setMenuItems(data);
      }
      fetchMenu();
      fetchMenuItems();
    }
  }, [menuId]);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newItemName);
    formData.append('description', newItemDescription);
    formData.append('price', newItemPrice);
    formData.append('image', newItemImage);

    const response = await fetch(`/api/admin/menus/${menuId}/items`, {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      const newItem = await response.json();
      setMenuItems((prevItems) => [...prevItems, newItem]);
      // Reset form fields
      setNewItemName('');
      setNewItemDescription('');
      setNewItemPrice('');
      setNewItemImage(null);
    }
  };

  return (
    <div>
      {menu ? (
        <>
          <h1>Edit Menu: {menu.name}</h1>

          {/* List of Menu Items */}
          <h2>Menu Items</h2>
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <img src={item.imageUrl} alt={item.name} width={100} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>${item.price.toFixed(2)}</p>
                {/* Add Edit and Delete buttons as needed */}
              </li>
            ))}
          </ul>

          {/* Add New Menu Item */}
          <h2>Add New Menu Item</h2>
          <form onSubmit={handleAddMenuItem}>
            <input
              type="text"
              placeholder="Item Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />
            <textarea
              placeholder="Item Description"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewItemImage(e.target.files[0])}
              required
            />
            <button type="submit">Add Item</button>
          </form>
        </>
      ) : (
        <p>Loading Menu...</p>
      )}
    </div>
  );
}
