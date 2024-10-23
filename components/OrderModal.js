'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4
import { OrderContext } from '../contexts/OrderContext';
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';
import ClubMap from './ClubMap';

export default function OrderModal({ onClose }) {
  const { order, removeItem, submitOrder } = useContext(OrderContext);
  const [comments, setComments] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef(null);
  const [showCommentBox, setShowCommentBox] = useState({});
  const [customerId, setCustomerId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customerIcon, setCustomerIcon] = useState('🙂');
  const [showClubMap, setShowClubMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null); // Add this line

  // Retrieve or generate the customer ID and icon
  useEffect(() => {
    let savedCustomerId = localStorage.getItem('customerId');
    if (!savedCustomerId) {
      savedCustomerId = uuidv4();
      localStorage.setItem('customerId', savedCustomerId);
    }
    setCustomerId(savedCustomerId);

    // Retrieve customer icon from localStorage
    const savedCustomerIcon = localStorage.getItem('customerIcon');
    if (savedCustomerIcon) {
      setCustomerIcon(savedCustomerIcon);
    }
  }, []);

  // Close the modal when the order is empty
  useEffect(() => {
    if (order.length === 0) {
      onClose();
    }
  }, [order.length, onClose]);

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (order.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setIsLoading(true);
    try {
      // Pass coordinates along with other parameters
      await submitOrder(null, comments, selectedOptions, customerId, coordinates);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle button click with animation
  const handleButtonClick = () => {
    if (buttonRef.current) {
      buttonRef.current.classList.add('clicked');
    }

    handleSubmitOrder();

    setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.classList.remove('clicked');
      }
    }, 1000);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            className="emoji-picker-container"
            onClick={(e) => e.stopPropagation()} // Stop click propagation
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}



        {/* Order Content */}
        {order.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
          </div>
        ) : (
            
          <div className="order-card">
            {/* Map Icon and Coordinates */}
           
            <ul className="order-list-new">
              {order.map((item) => (
                <li key={item.id} className="order-item-row-new">
                  <div className="order-item-content">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-button-new"
                    >
                      X
                    </button>
                    <div
                      className="item-info"
                      style={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                      <span
                        className="item-quantity-new"
                        style={{ marginRight: '5px' }}
                      >
                        {item.quantity}x
                      </span>
                      <span className="item-name-new">{item.name}</span>
                    </div>
                  </div>

                  {/* Options */}
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
                            onChange={() =>
                              handleOptionChange(item.id, option.id)
                            }
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

                  {/* Comment Box Toggle */}
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

                  {/* Comment Box */}
                  {showCommentBox[item.id] && (
                    <textarea
                      placeholder="Additional instructions"
                      value={comments[item.id] || ''}
                      onChange={(e) =>
                        handleCommentChange(item.id, e.target.value)
                      }
                      className="comment-box-new"
                    ></textarea>
                  )}
                </li>
              ))}
            </ul>
            {/* Total Price Display */}
            <div className="mt-6 mb-4">
              <h2 className="text-4xl font-bold text-center">
                <span className="text-yellow-400">
                  {order.reduce((total, item) => total + (item.price * item.quantity), 0)}
                </span>
                <span className="text-white">฿</span>
              </h2>
            </div>
          </div>
        )}
                {/* Club Map */}
                {showClubMap && (
          <ClubMap
            onClose={() => setShowClubMap(false)}
            setCoordinates={setCoordinates} // Pass setCoordinates prop
          />
        )}
         <div className="map-icon-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button onClick={() => setShowClubMap(true)} className="map-icon">
                🗺️
              </button>
              {/* Display coordinates if they exist */}
              {coordinates && (
                <span className="coordinates-display" style={{
                  color: '#ff1493',
                  marginTop: '5px',
                  textAlign: 'center'
                }}>
                  ({coordinates.x}, {coordinates.z})
                </span>
              )}
            </div>
            {coordinates && (
              <div className="submit-button-container-new">
                {isLoading ? (
                  <div className="loading-animation">⏳</div>
                ) : (
                  <button
                    onClick={handleButtonClick}
                    className="submit-button-new"
                    ref={buttonRef}
                  >
                    👍👨‍🍳
                  </button>
                )}
              </div>
            )}
      </div>
    </div>
  );
}
