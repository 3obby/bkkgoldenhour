'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
// You might need to install an emoji picker library, e.g., react-emoji-picker
import dynamic from 'next/dynamic';

// Dynamically import the emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function OrdersInfo({ onClose }) {
  const [customerId, setCustomerId] = useState(null);
  const [isCustomerIdLoading, setIsCustomerIdLoading] = useState(true);
  const [customerIcon, setCustomerIcon] = useState('🗿');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingText, setLoadingText] = useState('.');
  const emojiPickerRef = useRef(null);

  // Generate or retrieve the customer ID
  useEffect(() => {
    let storedCustomerId = localStorage.getItem('customerId');
    if (!storedCustomerId) {
      storedCustomerId = uuidv4();
      localStorage.setItem('customerId', storedCustomerId);
    }
    setCustomerId(storedCustomerId);
    setIsCustomerIdLoading(false);
  }, []);

  // Load the customerIcon from localStorage
  useEffect(() => {
    const storedIcon = localStorage.getItem('customerIcon');
    if (storedIcon) {
      setCustomerIcon(storedIcon);
    }
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

  // Handle emoji selection
  const handleEmojiClick = async (emojiObject) => {
    const selectedEmoji = emojiObject.emoji;
    setCustomerIcon(selectedEmoji);
    setShowEmojiPicker(false);
    // Store in localStorage
    localStorage.setItem('customerIcon', selectedEmoji);

    // Send POST request to update the customer icon in the database
    try {
      const response = await fetch('/api/updateCustomerIcon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, customerIcon: selectedEmoji }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update customer icon');
      }
    } catch (error) {
      console.error('Error updating customer icon:', error);
    }
  };

  // Handle click outside of emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        showEmojiPicker
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

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
          <div className="gamertag" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <div className="gamertag-icon">{customerIcon}</div>
            <div className="gamertag-text">
              Anon: {customerId.slice(0, 7)}
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="emoji-picker-container">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* Past Orders Section */}
        <div className="past-orders order-status-card">
          <h2 style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '16px' }}>
            👨‍🍳
          </h2>
          {customerOrders.length > 0 ? (
            customerOrders.map((order) => (
              <div
                key={order.id}
                className={`past-order ${order.status}`}
              >
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
            // Replace the <pre> element with a <div> and apply the className "euphoria-text"
            <div className="euphoria-text">
              {asciiFrames[currentFrame]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
