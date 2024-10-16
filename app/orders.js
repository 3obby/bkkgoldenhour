import { useState, useEffect } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    }
    fetchOrders();
  }, []);

  const handleOrderComplete = (orderId) => {
    // Logic to mark order as complete or delete
  };

  return (
    <div>
      <h1>Incoming Orders</h1>
      {orders.map(order => (
        <div key={order.id}>
          <h2>Order #{order.id}</h2>
          {/* Display order details */}
          <button onClick={() => handleOrderComplete(order.id)}>
            Complete Order
          </button>
        </div>
      ))}
    </div>
  );
}
