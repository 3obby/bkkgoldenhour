'use client';

import { useContext, useState } from 'react';
import { OrderContext } from '../../contexts/OrderContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Checkout() {
  const { order, removeItem, submitOrder } = useContext(OrderContext);
  const [comments, setComments] = useState({});
  const [tableNumber, setTableNumber] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});
  const router = useRouter();

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleSubmitOrder = async () => {
    await submitOrder(tableNumber, comments, selectedOptions);
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
    <div className="checkout-page">
      {/* Nav bar */}
      <div className="navbar">
        <button onClick={() => router.back()} className="nav-button">
          Back
        </button>
        <Link href="/adminportal">
          <button className="nav-button">🔒</button>
        </Link>
      </div>

      <div style={{ height: '50px' }}></div>
      {order.length === 0 ? (
        <div className="flex items-center justify-center h-screen">
          {/* ...empty cart content... */}
        </div>
      ) : (
        <>
          <ul className="order-list">
            {order.map((item) => (
              <li key={item.id} className="order-item-row">
                {/* Remove item button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="remove-button"
                >
                  X
                </button>
                {/* Item details */}
                <span
                  className="item-details"
                  style={{
                    color: 'white',
                    fontSize: '20px',
                    textShadow:
                      '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
                  }}
                >
                  {item.quantity}x{' '}
                  <span style={{ color: 'gold' }}>{item.name}</span>{' '}
                  {(item.price * item.quantity)}฿
                </span>
                {/* Display item options as radio buttons */}
                {item.menuItemOptions && item.menuItemOptions.length > 0 && (
                  <div className="options-container">
                    {item.menuItemOptions.map((option) => (
                      <label key={option.id} className="option-label">
                        <input
                          type="radio"
                          name={`option-${item.id}`}
                          value={option.id}
                          checked={selectedOptions[item.id] === option.id}
                          onChange={() => handleOptionChange(item.id, option.id)}
                        />
                        {option.name} (+{option.price}฿)
                      </label>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Submit Order Button */}
          <button onClick={handleSubmitOrder} className="button">
            Submit Order
          </button>
        </>
      )}
    </div>
  );
}
