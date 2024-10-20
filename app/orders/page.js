'use client';

import { useState, useEffect } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
    // Optionally, set an interval to refresh orders periodically
    const intervalId = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  const handleOrderComplete = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (response.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="orders-page">
      <h1>Active Orders</h1>
      {isLoading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No active orders.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <h2>Order #{order.id}</h2>
              {order.tableNumber && <p>Table Number: {order.tableNumber}</p>}
              <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
              <ul>
                {order.orderItems.map((item) => (
                  <li key={item.id}>
                    <p>
                      {item.quantity} x {item.menuItem.name}
                    </p>
                    {/* Display selected options */}
                    {item.orderItemOptions && item.orderItemOptions.length > 0 && (
                      <ul>
                        {item.orderItemOptions.map((option) => (
                          <li key={option.id}>
                            Option: {option.menuItemOption.name} (+{option.menuItemOption.price}฿)
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.comment && <p>Comment: {item.comment}</p>}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleOrderComplete(order.id)} className="button">
                Mark as Completed
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
