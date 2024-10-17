'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditItem() {
  const [item, setItem] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imageUrl: '',
  });
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const router = useRouter();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadStatus('uploading');
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setItem({ ...item, imageUrl: data.imageUrl });
          setUploadStatus('success');
        } else {
          setUploadStatus('error');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadStatus('error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Submit the item data, including the imageUrl from the upload
    const response = await fetch('/api/admin/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl, // Use the uploaded image URL
      }),
    });

    if (response.ok) {
      // Navigate back to the admin portal or display a success message
      router.push('/adminportal');
    } else {
      // Handle error
      console.error('Failed to create item');
    }
  };

  return (
    <div className="edit-item">
      <h1 className="title">Create New Menu Item</h1>
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
          className="input-file"
        />

        {/* Display upload status and image preview */}
        {uploadStatus === 'uploading' && <p className="status">Uploading image...</p>}
        {uploadStatus === 'success' && <p className="status success">Image uploaded successfully!</p>}
        {uploadStatus === 'error' && <p className="status error">Error uploading image. Please try again.</p>}

        {item.imageUrl && (
          <div className="image-preview">
            <p>Image Preview:</p>
            <img src={item.imageUrl} alt="Uploaded" width={150} />
          </div>
        )}

        <button type="submit" disabled={uploadStatus !== 'success'} className="button">
          Save Item
        </button>
      </form>
    </div>
  );
}
