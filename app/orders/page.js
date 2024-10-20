'use client';

import { useState, useEffect } from 'react';

// Add LoadingDots component
function LoadingDots() {
  const [dots, setDots] = useState('.');
  useEffect(() => {
    const sequence = ['.', '..', '...', '..', '.'];
    let index = 0;
    const interval = setInterval(() => {
      setDots(sequence[index]);
      index = (index + 1) % sequence.length;
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span className="loading-animation">{dots}</span>;
}

function OrderItem({ order, handleOrderComplete, loadingOrderId }) {
  return (
    <li className="order-item">
      {order.status !== 'completed' && (
        <button
          onClick={() => handleOrderComplete(order.id)}
          className="complete-button"
        >
          {loadingOrderId === order.id ? <LoadingDots /> : '✅'}
        </button>
      )}
      <div className="order-content">
        <h2>Order #{order.id}</h2>
        {order.tableNumber && <p>Table Number: {order.tableNumber}</p>}
        <p>Status: {order.status}</p>
        <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
        <h3>Items:</h3>
        <ul className="order-items-list">
          {order.orderItems.map((item) => (
            <li key={item.id} className="order-item-detail">
              <p>
                <strong className="gold-text">{item.menuItem.name}</strong> x{item.quantity} - ${item.menuItem.price}
              </p>
              {item.comment && <p>Comment: {item.comment}</p>}
              {item.orderItemOptions.length > 0 && (
                <ul className="order-item-options">
                  {item.orderItemOptions.map((option) => (
                    <li key={option.id}>
                      <span className="gold-text">{option.menuItemOption.name}</span> - ${option.menuItemOption.price}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [groupByCustomer, setGroupByCustomer] = useState(false); // New state

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
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOrderComplete = async (orderId) => {
    setLoadingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (response.ok) {
        // Update the order's status in the state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: 'completed' } : order
          )
        );
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const filteredOrders = hideCompleted
    ? orders.filter((order) => order.status !== 'completed')
    : orders;

  let ordersContent;
  if (groupByCustomer) {
    // Group orders by customer
    const ordersByCustomer = filteredOrders.reduce((groups, order) => {
      const customerId = order.customer?.id || 'Anonymous';
      if (!groups[customerId]) {
        groups[customerId] = [];
      }
      groups[customerId].push(order);
      return groups;
    }, {});

    ordersContent = Object.entries(ordersByCustomer).map(([customerId, customerOrders]) => {
      const customerIcon = customerOrders[0].customer?.customerIcon || '👤';
      return (
        <div key={customerId} className="customer-group">
          <h2 className="customer-icon">{customerIcon}</h2>
          {customerOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              handleOrderComplete={handleOrderComplete}
              loadingOrderId={loadingOrderId}
            />
          ))}
        </div>
      );
    });
  } else {
    ordersContent = filteredOrders.map((order) => (
      <OrderItem
        key={order.id}
        order={order}
        handleOrderComplete={handleOrderComplete}
        loadingOrderId={loadingOrderId}
      />
    ));
  }

  return (
    <div className="orders-page">
      <nav className="orders-navbar">
        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className="toggle-button"
        >
          {hideCompleted ? 'Show Completed Orders' : 'Hide Completed Orders'}
        </button>
        <button
          onClick={() => setGroupByCustomer(!groupByCustomer)}
          className="toggle-button"
        >
          {groupByCustomer ? 'Ungroup Orders' : 'Group by Customer'}
        </button>
      </nav>
      {isLoading ? (
        <p className="orders-loading">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="orders-empty">No orders.</p>
      ) : (
        <div className="orders-list">
          {ordersContent}
        </div>
      )}
    </div>
  );
}
