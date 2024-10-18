'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams

export default function EditItem() {
  const [item, setItem] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  });
  const [existingCategories, setExistingCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [uploadStatus, setUploadStatus] = useState('success'); // Default to 'success' to enable Save button
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query parameters

  const itemId = searchParams.get('id'); // Retrieve the item ID from query params

  useEffect(() => {
    // Fetch existing categories from the server
    const fetchCategories = async () => {
      // ... existing code ...
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // If itemId exists, fetch item data
    if (itemId) {
      const fetchItemData = async () => {
        try {
          const response = await fetch(`/api/admin/items?id=${itemId}`);
          if (response.ok) {
            const data = await response.json();

            // Set item data
            setItem({
              name: data.name,
              description: data.description,
              price: data.price.toString(),
              imageUrl: data.imageUrl,
            });

            // Set selected categories
            setSelectedCategories(data.categories.map((cat) => cat.name));
          } else {
            console.error('Failed to fetch item data');
          }
        } catch (error) {
          console.error('Error fetching item data:', error);
        }
      };
      fetchItemData();
    }
  }, [itemId]);

  const handleImageChange = async (e) => {
    // ... existing code ...
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Combine selected categories and new category
    const categories = [...selectedCategories];
    if (newCategory) {
      categories.push(newCategory);
    }

    // Prepare the item data
    const itemData = {
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      imageUrl: item.imageUrl,
      categories,
    };

    // Determine the method and URL based on whether we're creating or updating
    const method = itemId ? 'PUT' : 'POST';
    const url = '/api/admin/items';

    // Include itemId in the data if updating
    if (itemId) {
      itemData.id = parseInt(itemId);
    }

    // Submit the item data
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    if (response.ok) {
      // Navigate back to the admin portal or display a success message
      router.push('/adminportal');
    } else {
      // Handle error
      console.error('Failed to save item');
    }
  };

  return (
    <div className="edit-item">
      <h1 className="title">{itemId ? 'Edit Menu Item' : 'Create New Menu Item'}</h1>
      <form onSubmit={handleSubmit} className="edit-item-form">
        <input
          type="text"
          placeholder="Item Name"
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          required
          className="input-text"
        />
        <textarea
          placeholder="Item Description"
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.target.value })}
          required
          className="textarea"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
          required
          className="input-text"
        />

        {/* Display existing image if available */}
        {item.imageUrl && (
          <div className="image-preview">
            <p>Current Image:</p>
            <img src={item.imageUrl} alt="Uploaded" width={150} />
          </div>
        )}

        {/* Image upload field */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="input-file"
        />

        {/* Upload status messages */}
        {/* ... existing upload status code ... */}

        {/* Category Selection */}
        {/* ... existing category selection code ... */}

        <button type="submit" disabled={uploadStatus === 'uploading'} className="button">
          {itemId ? 'Update Item' : 'Save Item'}
        </button>
      </form>
    </div>
  );
}
