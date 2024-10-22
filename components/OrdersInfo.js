'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function OrdersInfo({ onClose }) {
  const [customerId, setCustomerId] = useState(null);
  const [isCustomerIdLoading, setIsCustomerIdLoading] = useState(true);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingText, setLoadingText] = useState('.');

  // Generate or retrieve the customer ID
  useEffect(() => {
    let customerId = localStorage.getItem('customerId');
    if (!customerId) {
      customerId = uuidv4();
      localStorage.setItem('customerId', customerId);
    }
    setCustomerId(customerId);
    setIsCustomerIdLoading(false);
  }, []);

  // Loading animation for customerId
  useEffect(() => {
    if (isCustomerIdLoading) {
      const loadingSequence = ['.', '..', '...', '..', '.'];
      let index = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingSequence[index]);
        index = (index + 1) % loadingSequence.length;
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isCustomerIdLoading]);

  // Fetch customer orders
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (customerId) {
        try {
          const response = await fetch(`/api/customer/orders/${customerId}`);
          const orders = await response.json();
          setCustomerOrders(orders);
        } catch (error) {
          console.error('Error fetching customer orders:', error);
        }
      }
    };
    fetchCustomerOrders();
  }, [customerId]);

  // ASCII frames for the spinning cube animation
  const asciiFrames = [
    `<        >`,
    `<E       >`,
    `<EU      >`,
    `<EUP     >`,
    `<EUPH    >`,
    `<EUPHO   >`,
    `<EUPHOR  >`,
    `<EUPHORI >`,
    `<EUPHORIA>`,
    `<        >`,
    `<EUPHORIA>`,
    `<        >`,
    `<EUPHORIA>`,




  ];

  // State to keep track of the current frame
  const [currentFrame, setCurrentFrame] = useState(0);

  // Effect to loop through the frames
  useEffect(() => {
    if (customerOrders.length === 0) {
      const interval = setInterval(() => {
        setCurrentFrame((prevFrame) => (prevFrame + 1) % asciiFrames.length);
      }, 200); // Adjust the speed as needed
      return () => clearInterval(interval);
    }
  }, [customerOrders]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
  

        {/* Gamertag Display */}
        {isCustomerIdLoading ? (
          <div className="gamertag-loading">
            <div className="loading-text">Loading{loadingText}</div>
          </div>
        ) : (
          <div className="gamertag">
            <div className="gamertag-icon">🗿</div>
            <div className="gamertag-text">
              Anon: {customerId.slice(0, 5)}
            </div>
          </div>
        )}

        {/* Past Orders Section */}
        <div className="past-orders order-status-card">
          <h2 style={{ display: 'flex', alignItems: 'center', height: '100%' }}>👨‍🍳</h2>
          {customerOrders.length > 0 ? (
            customerOrders.map((order) => (
              <div key={order.id} className={`past-order ${order.status}`}>
                <p>
                  {order.status === 'completed' ? '👨‍🍳✅' : '⏳👨‍🍳'} Order #{order.id}
                </p>
                <ul className="past-order-items">
                  {order.orderItems.map((item) => (
                    <li key={item.id}>
                      {item.quantity} x {item.menuItem.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            // Display the ASCII animation when there are no past orders
            <pre
              style={{
                fontSize: '22px',
                lineHeight: '8px',
                minHeight: '100px',
                color: '#FF1493',
              }}
            >
              {asciiFrames[currentFrame]}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
