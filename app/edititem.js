import { useState } from 'react';
import { useRouter } from 'next/router';

export default function EditItem() {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState({
    name: '',
    description: '',
    price: 0.0,
    image: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logic to upload image to S3 and save item to the database
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
        />
        <textarea
          placeholder="Description"
          value={item.description}
          onChange={e => setItem({ ...item, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={item.price}
          onChange={e => setItem({ ...item, price: parseFloat(e.target.value) })}
        />
        <input
          type="file"
          onChange={e => setItem({ ...item, image: e.target.files[0] })}
        />
        <button type="submit">Save Item</button>
      </form>
    </div>
  );
}
