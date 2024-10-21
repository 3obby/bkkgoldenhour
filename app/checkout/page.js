'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { OrderContext } from '../../contexts/OrderContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

export default function Checkout() {
  const { order, removeItem, submitOrder } = useContext(OrderContext);
  const [comments, setComments] = useState({});
  const [tableNumber, setTableNumber] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [isCustomerIdLoading, setIsCustomerIdLoading] = useState(true); // Add this state
  const [loadingText, setLoadingText] = useState('.'); // State for loading animation
  const router = useRouter();
  const [customerOrders, setCustomerOrders] = useState([]);
  const [showButtonEffect, setShowButtonEffect] = useState(false);
  const buttonRef = useRef(null); // Create a ref for the submit button
  const [showCommentBox, setShowCommentBox] = useState({});

  // Load currentOrderId and orderStatus from localStorage on component mount
  useEffect(() => {
    const savedOrderId = localStorage.getItem('currentOrderId');
    const savedOrderStatus = localStorage.getItem('orderStatus');

    if (savedOrderId) {
      setCurrentOrderId(savedOrderId);
    }

    if (savedOrderStatus) {
      setOrderStatus(savedOrderStatus);
    }
  }, []);

  // Generate or retrieve the customer ID
  useEffect(() => {
    let customerId = localStorage.getItem('customerId');
    if (!customerId) {
      customerId = uuidv4();
      localStorage.setItem('customerId', customerId);
    }
    setCustomerId(customerId);
    setIsCustomerIdLoading(false); // Set loading to false after getting customerId
  }, []);

  // Fetch order status periodically if there's a currentOrderId
  useEffect(() => {
    let intervalId;
    if (currentOrderId) {
      fetchOrderStatus();
      intervalId = setInterval(fetchOrderStatus, 5000); // Poll every 5 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // Include fetchOrderStatus in dependencies to avoid warnings
  }, [currentOrderId]);

  // Loading animation for customerId
  useEffect(() => {
    if (isCustomerIdLoading) {
      const loadingSequence = ['.', '..', '...', '..', '.'];
      let index = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingSequence[index]);
        index = (index + 1) % loadingSequence.length;
      }, 500); // Change every 500ms
      return () => clearInterval(interval);
    }
  }, [isCustomerIdLoading]);

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${currentOrderId}`);
      const data = await response.json();
      setOrderStatus(data.status);
      // Save the latest order status to localStorage
      localStorage.setItem('orderStatus', data.status);

      // Optionally handle order completion
      if (data.status === 'completed' || data.status === 'cancelled') {
        // Clear the order tracking data
        localStorage.removeItem('currentOrderId');
        localStorage.removeItem('orderStatus');
        setCurrentOrderId(null);
        setOrderStatus(null);
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleSubmitOrder = async () => {
    if (order.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    // Move the setIsLoading(true) here if you want the loading state to begin after the animation
    setIsLoading(true);
    try {
      const data = await submitOrder(tableNumber, comments, selectedOptions, customerId);
      console.log(data);
      
      setCurrentOrderId(data.order.id);
      setOrderStatus(data.order.status);
      // Save currentOrderId and orderStatus to localStorage
      localStorage.setItem('currentOrderId', data.order.id);
      localStorage.setItem('orderStatus', data.order.status);
    } catch (error) {
      console.error(error);
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle button click and trigger animations
  const handleButtonClick = () => {
    // Trigger the button click effect
    setShowButtonEffect(true);

    // Trigger button animations by adding a class
    if (buttonRef.current) {
      buttonRef.current.classList.add('clicked');
    }

    // Call handleSubmitOrder
    handleSubmitOrder();

    // Reset the effect after the animation duration
    setTimeout(() => {
      setShowButtonEffect(false);
      if (buttonRef.current) {
        buttonRef.current.classList.remove('clicked'); // Remove the class
      }
    }, 1000); // Adjust time to match animation duration
  };

  const handleCommentChange = (itemId, value) => {
    setComments({ ...comments, [itemId]: value });
  };

  const handleOptionChange = (itemId, optionId) => {
    setSelectedOptions({
      ...selectedOptions,
      [itemId]: optionId,
    });
  };

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

  // Calculate total quantity in the order
  const orderCount = order.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="checkout-page-new">
      {/* Nav bar */}
      <div className="navbar">
        <button onClick={() => router.back()} className="nav-button">
          <span style={{ fontSize: '300%',  marginLeft: '20px'  }}>🏠</span>
        </button>
       
      </div>

      {/* Spacer element to prevent content from being hidden under navbar */}
      <div style={{ height: '92px',marginBottom: '20px' }}></div>

      {/* Shopping Cart Icon at the top */}
      {orderCount === 0 && (
        <div className="cart-icon-container" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Image
            src="/images/shopping-cart.png"
            alt="Shopping Cart"
            width={128}
            height={128}
          />
          <span className="order-count">0</span>
        </div>
      )}


      {order.length === 0 ? (
        <div className="flex items-center justify-center">
          {/* ...empty cart content... */}
        </div>
      ) : (
        // Begin styled card
        <div className="order-card">
          <ul className="order-list-new">
            {order.map((item) => (
              <li key={item.id} className="order-item-row-new">
                {/* Adjusted Order Item Row */}
                <div className="order-item-content">
                <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="remove-button-new"
                  >
                    X
                  </button>
                  <div className="item-info" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span className="item-quantity-new" style={{ marginRight: '5px' }}>{item.quantity}x</span>
                    <span className="item-name-new">{item.name}</span>
                  </div>
               
                </div>

                {/* Options below item */}
                {item.menuItemOptions && item.menuItemOptions.length > 0 && (
                  <div className="options-container-new">
                    {item.menuItemOptions.map((option) => (
                      <label key={option.id} className="option-label-new">
                        <span className="option-name-new">
                          {option.name} (+{option.price}฿)
                        </span>
                        <input
                          type="radio"
                          name={`option-${item.id}`}
                          value={option.id}
                          checked={selectedOptions[item.id] === option.id}
                          onChange={() => handleOptionChange(item.id, option.id)}
                          className="option-radio-new"
                        />
                      </label>
                    ))}
                  </div>
                )}
                {/* Item price */}
                <span className="item-price-new">
                  {item.price * item.quantity}฿
                </span>

                {/* Add the new chat button */}
                <button
                  onClick={() =>
                    setShowCommentBox((prevState) => ({
                      ...prevState,
                      [item.id]: !prevState[item.id],
                    }))
                  }
                  className="comment-toggle-button"
                >
                  💬
                </button>

                {/* Conditionally render the comment box */}
                {showCommentBox[item.id] && (
                  <textarea
                    placeholder="Additional instructions"
                    value={comments[item.id] || ''}
                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                    className="comment-box-new"
                  ></textarea>
                )}
              </li>
            ))}
          </ul>

          {/* Submit Order Button and Loading Animation */}
          <div className="submit-button-container-new">
            {isLoading ? (
              <div className="loading-animation">⏳</div>
            ) : (
              <>
                <button
                  onClick={handleButtonClick}
                  className="submit-button-new"
                  ref={buttonRef} // Attach the ref to the button
                >
                  👍👨‍🍳
                </button>
                {showButtonEffect && (
                  <div className="button-click-effect"></div>
                )}
              </>
            )}
          </div>
        </div>
        // End styled card
      )}

      {/* Apply order-status-card styling to the 'past orders' section */}
   
        <div className="past-orders order-status-card">
          <h2 style={{ display: 'flex', alignItems: 'center', height: '100%' }}>👨‍🍳</h2>
          {customerOrders.map((order) => (
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
          ))}
        </div>
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
    </div>
  );
}
