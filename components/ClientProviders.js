
'use client';

import React from 'react';
import { OrderProvider } from '../contexts/OrderContext';

export default function ClientProviders({ children }) {
  return (
    <OrderProvider>
      {children}
    </OrderProvider>
  );
}