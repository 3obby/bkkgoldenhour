'use client';

import { useState, useEffect } from 'react';
import orderManager from '../../utils/OrderManager';
import Link from 'next/link';

export default function Checkout() {
  const [order, setOrder] = useState([]);

  useEffect(() => {
    setOrder(orderManager.getOrder());
  }, []);

  const handleRemoveItem = (itemId) => {
    orderManager.removeItem(itemId);
    setOrder(orderManager.getOrder());
  };

  const handleSubmitOrder = () => {
    orderManager.submitOrder();
    setOrder([]);
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
                <p>Price: ${item.price.toFixed(2)}</p>
                <button onClick={() => handleRemoveItem(item.id)} className="button">
                  Remove
                </button>
              </li>
            ))}
          </ul>
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
