import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container" style={{ padding: '3rem', color: '#57606a' }}>Loading…</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Order History</h1>
        <p>{orders.length} orders total</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <p>No orders yet. Go shop something!</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <strong>Order #{order.id}</strong>
                <span style={{ color: '#57606a', fontSize: '.82rem', marginLeft: '.75rem' }}>
                  {order.created_at}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                <span style={{ color: '#57606a', fontSize: '.88rem' }}>{order.customer}</span>
                <span className="badge badge-green">${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="order-items">
              {(order.items || []).map(item => (
                <div key={item.id} className="order-item-thumb">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{item.name}</div>
                    <div style={{ color: '#57606a', fontSize: '.76rem' }}>×{item.quantity} · ${item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
