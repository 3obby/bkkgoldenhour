import { useState } from 'react';
import { useRouter } from 'next/router';

export default function EditItem() {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState({
    name: '',
    description: '',
    price: 0.0,
    imageUrl: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/items', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          id: id ? parseInt(id) : undefined,
        }),
      });

      if (response.ok) {
        router.push('/adminportal');
      } else {
        console.error('Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
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
        } else {
          console.error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div>
      <h1>{id ? 'Edit Menu Item' : 'Create New Menu Item'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={item.name}
          onChange={e => setItem({ ...item, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={item.description}
          onChange={e => setItem({ ...item, description: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={item.price}
          onChange={e => setItem({ ...item, price: parseFloat(e.target.value) })}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          required
        />
        {item.imageUrl && (
          <img src={item.imageUrl} alt="Preview" width="200" />
        )}
        <button type="submit">Save Item</button>
      </form>
    </div>
  );
}
