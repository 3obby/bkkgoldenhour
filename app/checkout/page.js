'use client';

import { useContext, useState } from 'react';
import { OrderContext } from '../../contexts/OrderContext';
import Link from 'next/link';

export default function Checkout() {
  const { order, removeItem, submitOrder } = useContext(OrderContext);
  const [comments, setComments] = useState({});
  const [tableNumber, setTableNumber] = useState('');

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleSubmitOrder = async () => {
    // Pass comments and tableNumber to submitOrder
    await submitOrder(tableNumber, comments);
    // Optionally, navigate to a confirmation page or display a success message
  };

  const handleCommentChange = (itemId, value) => {
    setComments({ ...comments, [itemId]: value });
  };

  return (
    <div className="checkout-page">
      <h1 className="title">Your Order</h1>
      {order.length === 0 ? (
        <p>Your order is empty.</p>
      ) : (
        <>
          <ul className="order-list">
            {order.map((item) => (
              <li key={item.id} className="order-item">
                <h2 className="item-name">{item.name}</h2>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${(item.price * item.quantity).toFixed(2)}</p>
                <textarea
                  placeholder="Add a comment..."
                  value={comments[item.id] || ''}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  className="comment-input"
                />
                <button onClick={() => handleRemoveItem(item.id)} className="button">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="table-number-input">
            <label htmlFor="tableNumber">Table Number (optional):</label>
            <input
              type="number"
              id="tableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="input-text"
            />
          </div>
          <button onClick={handleSubmitOrder} className="button">
            Submit Order
          </button>
        </>
      )}
      <Link href="/">
        <button className="button">Back to Menu</button>
      </Link>
    </div>
  );
}
