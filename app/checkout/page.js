'use client';

import { useContext, useState, useEffect } from 'react';
import { OrderContext } from '../../contexts/OrderContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Checkout() {
  const { order, removeItem, submitOrder } = useContext(OrderContext);
  const [comments, setComments] = useState({});
  const [tableNumber, setTableNumber] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const router = useRouter();

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
  }, [currentOrderId]);

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${currentOrderId}`);
      const data = await response.json();
      setOrderStatus(data.status);
    } catch (error) {
      console.error('Error fetching order status:', error);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleSubmitOrder = async () => {
    setIsLoading(true);
    try {
      const data = await submitOrder(tableNumber, comments, selectedOptions);
      setCurrentOrderId(data.order.id);
      setOrderStatus(data.order.status);
    } catch (error) {
      console.error(error);
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
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
    <div className="checkout-page-new">
      {/* Nav bar */}
      <div className="navbar">
        <button onClick={() => router.back()} className="nav-button">
          <span style={{ fontSize: '300%',  marginLeft: '20px'  }}>🏠</span>
        </button>
        <Link href="/adminportal">
          <button style={{ fontSize: '300%',  marginRight: '20px' }} className="nav-button">🔒</button>
        </Link>
      </div>

      <div style={{ marginTop: '120px' }}>
        {/* Order status floating card */}
        {currentOrderId && (
          <div className="order-status-card">
            <p>
              {orderStatus === 'completed' ? '✅👨‍🍳 Your order is ready!' : '⏳👨‍🍳 Your order is being prepared.'}
            </p>
          </div>
        )}
      </div>

      {order.length === 0 ? (
        <div className="flex items-center justify-center h-screen">
          {/* ...empty cart content... */}
        </div>
      ) : (
        <>
          <ul className="order-list-new">
            {order.map((item) => (
              <li key={item.id} className="order-item-row-new">
                {/* Order Item Row */}
                <div className="order-item-info-new">
                  {/* Remove item button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="remove-button-new"
                  >
                    X
                  </button>
                  {/* Item quantity */}
                  <span className="item-quantity-new">{item.quantity}x</span>
                  {/* Item name */}
                  <span className="item-name-new">{item.name}</span>
                  {/* Item price */}
                  <span className="item-price-new">
                    {item.price * item.quantity}฿
                  </span>
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
                {/* Comment Text Box */}
                <textarea
                  placeholder="Additional instructions"
                  value={comments[item.id] || ''}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  className="comment-box-new"
                ></textarea>
              </li>
            ))}
          </ul>

          {/* Submit Order Button or Loading Animation */}
          <div className="submit-button-container-new">
            {isLoading ? (
              <div className="loading-animation">⏳</div>
            ) : (
              <button onClick={handleSubmitOrder} className="submit-button-new">
                👍
              </button>
            )}
          </div>
        </>
      )}
      <style jsx>{`
        .loading-animation {
          display: inline-block;
          font-size: 48px;
          animation: loadingAnimation 2s infinite;
        }

        @keyframes loadingAnimation {
          0% {
            transform: rotate(-15deg) scale(1);
          }
          25% {
            transform: rotate(15deg) scale(1.2);
          }
          50% {
            transform: rotate(-15deg) scale(1);
          }
          75% {
            transform: rotate(15deg) scale(1.2);
          }
          100% {
            transform: rotate(-15deg) scale(1);
          }
        }

        .order-status-card {
          background-color: rgba(255, 255, 255, 0.9);
          color: black;
          padding: 10px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
