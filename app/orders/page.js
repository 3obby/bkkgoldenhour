 // Start of Selection
'use client';

import { useState, useEffect, useRef } from 'react';

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
  const checkButtonRef = useRef(null);

  // Add state and refs for confirmation logic
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmTimeoutRef = useRef(null);

  // Add state to manage the modal visibility
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

  const handleCheckButtonClick = async () => {
    if (isConfirming) {
      // User confirmed deletion
      clearTimeout(confirmTimeoutRef.current);
      setIsConfirming(false);
      await handleOrderComplete(order.id);
    } else {
      // Start confirmation process
      setIsConfirming(true);
      confirmTimeoutRef.current = setTimeout(() => {
        // Reset confirmation after 3 seconds
        setIsConfirming(false);
      }, 3000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  // Calculate the order total
  const orderTotal = order.orderItems.reduce((total, item) => {
    const itemTotal = item.quantity * item.menuItem.price;
    const optionsTotal = item.orderItemOptions.reduce(
      (optTotal, option) => optTotal + option.menuItemOption.price,
      0
    ) * item.quantity;
    return total + itemTotal + optionsTotal;
  }, 0);

  // Extract customer icon
  const customerIcon = order.customer?.customerIcon || '👤';

  // Function to render the grid
  const renderGrid = () => {
    const gridSize = 10;
    const grid = [];

    // Initialize grid with 'X's
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push('X');
      }
      grid.push(row);
    }

    // Map the order onto the grid based on x and z (y) coordinates
    const xIndex = Math.round(order.x + 5);
    const yIndex = Math.round(order.z + 5); // z is y

    if (
      xIndex >= 0 && xIndex < gridSize &&
      yIndex >= 0 && yIndex < gridSize
    ) {
      grid[yIndex][xIndex] = order.customer?.customerIcon || '👤';
    }

    // Render the grid
    return (
      <div className="grid-container">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div key={colIndex} className="grid-cell">
                {cell !== 'X' ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <li className={`order-item ${isConfirming ? 'flashing-red' : ''}`}>
      {order.status !== 'completed' && (
        <button
          onClick={handleCheckButtonClick}
          className={`complete-button check-button-responsive ${isConfirming ? 'confirming' : ''}`}
          ref={checkButtonRef}
        >
          {isConfirming ? '❎' : '👍'}
        </button>
      )}
      <button
        onClick={() => setIsGridModalOpen(true)}
        className="grid-button"
      >
        Open Grid
      </button>

      <div className="order-content">
        <h2>
          #{order.id} {order.status}
        </h2>
        {order.tableNumber && <p>Table Number: {order.tableNumber}</p>}

        <ul className="order-items-list">
          {order.orderItems.map((item) => (
            <li key={item.id} className="order-item-detail">
              <p>
                <strong className="gold-text">
                  {item.menuItem.name}
                </strong>{' '}
                x{item.quantity} - ${item.menuItem.price}
              </p>
              {item.comment && <p>Comment: {item.comment}</p>}
              {item.orderItemOptions.length > 0 && (
                <ul className="order-item-options">
                  {item.orderItemOptions.map((option) => (
                    <li key={option.id}>
                      <span className="gold-text">
                        {option.menuItemOption.name}
                      </span>{' '}
                      - ${option.menuItemOption.price}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {/* Display the order total and customer icon inline */}
        <p
          className="order-total"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          
          }}
        >
          <span style={{ marginRight: '10px' }}>
                {order.customerId?.slice(0, 7)}
          </span>
          <span style={{ marginRight: '10px' }}>{customerIcon}</span>
          <span style={{   fontSize: '1.5em',
            color: 'gold' }}>
            {orderTotal}฿
          </span>
        </p>
      </div>

      {/* Modal for displaying the grid */}
      {isGridModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {renderGrid()}
            <button
              onClick={() => setIsGridModalOpen(false)}
              className="modal-close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(true);
  const [groupByCustomer, setGroupByCustomer] = useState(false);
  const [secondsUntilNextUpdate, setSecondsUntilNextUpdate] = useState(3);

  // New state to track deleting orders
  const [deletingOrderIds, setDeletingOrderIds] = useState([]);

  // Use a ref to track if it's the initial load
  const isInitialLoad = useRef(true);

  useEffect(() => {
    let isMounted = true; // To prevent state updates if component is unmounted

    async function fetchOrders() {
      if (isInitialLoad.current) {
        setIsLoading(true);
      }

      try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();

        if (isMounted) {
          const filteredData = data.filter(
            (order) => !deletingOrderIds.includes(order.id)
          );
          setOrders(filteredData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        if (isMounted && isInitialLoad.current) {
          setIsLoading(false);
          isInitialLoad.current = false; // Update after initial load
        }
      }
    }

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 15000);

    // Update seconds until next update
    const countdownIntervalId = setInterval(() => {
      setSecondsUntilNextUpdate((prev) => (prev > 0 ? prev - 1 : 15));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearInterval(countdownIntervalId);
    };
  }, [deletingOrderIds]);

  const handleOrderComplete = async (orderId) => {
    setLoadingOrderId(orderId);

    // Add the order ID to the deleting list and remove it from orders
    setDeletingOrderIds((prev) => [...prev, orderId]);
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
    console.log(`hid order ${orderId} while waiting for confirmation...`);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        console.log(`order ${orderId} deleted`);
      } else {
        console.error(`Failed to update order status for order ${orderId}`);
        // Re-add the order to the state
        setOrders((prevOrders) => [...prevOrders, removedOrder]);
        setDeletingOrderIds((prev) => prev.filter((id) => id !== orderId));
      }
    } catch (error) {
      console.error(`Error updating order status for order ${orderId}:`, error);
      // Re-add the order to the state
      setOrders((prevOrders) => [...prevOrders, removedOrder]);
      setDeletingOrderIds((prev) => prev.filter((id) => id !== orderId));
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
          className="toggle-button emoji-button"
          style={{
        margin: '16px',
          }}
        >
          {hideCompleted ? '💾' : '✅'}
        </button>
        <span className="update-countdown" style={{
            width: '100%',
          color: 'gold',
          display: 'flex',
          alignItems: 'center',
        }}>
          {secondsUntilNextUpdate}
        </span>

      </nav>
      {isLoading ? (
        <p className="orders-loading"><LoadingDots /></p>
      ) : filteredOrders.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="orders-empty">👀...</p>
        </div>
      ) : (
        <div className="orders-list">
          {ordersContent}
        </div>
      )}
    </div>
  );
}
