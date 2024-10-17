class OrderManager {
  constructor() {
    this.orderKey = 'currentOrder';
    this.order = this.loadOrder();
    // Periodic syncing every 5 minutes
    this.syncInterval = setInterval(() => this.syncOrderWithServer(), 300000); // 300,000 ms = 5 minutes
  }

  // Load order from localStorage
  loadOrder() {
    const orderData = localStorage.getItem(this.orderKey);
    return orderData ? JSON.parse(orderData) : [];
  }

  // Save order to localStorage
  saveOrder() {
    localStorage.setItem(this.orderKey, JSON.stringify(this.order));
  }

  // Add item to the order
  addItem(item) {
    const existingItem = this.order.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.order.push({ ...item, quantity: 1 });
    }
    this.saveOrder();
    this.syncOrderWithServer();
  }

  // Remove item from the order
  removeItem(itemId) {
    this.order = this.order.filter((item) => item.id !== itemId);
    this.saveOrder();
    this.syncOrderWithServer();
  }

  // Sync order with the server
  syncOrderWithServer() {
    fetch('/api/syncOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.order),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Order synced:', data);
      })
      .catch((error) => {
        console.error('Sync error:', error);
      });
  }

  // Submit order to the server
  submitOrder() {
    fetch('/api/submitOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.order),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Order submitted:', data);
        this.clearOrder();
      })
      .catch((error) => {
        console.error('Submission error:', error);
      });
  }

  // Clear the order
  clearOrder() {
    this.order = [];
    localStorage.removeItem(this.orderKey);
    clearInterval(this.syncInterval);
  }

  // Get the current order
  getOrder() {
    return this.order;
  }
}

const orderManager = new OrderManager();
export default orderManager;
