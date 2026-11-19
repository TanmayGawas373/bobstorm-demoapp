import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQty, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="page-header"><h1>Your Cart</h1></div>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header"><h1>Your Cart</h1></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.product_id}>
                  <td><img src={item.image} alt={item.name} /></td>
                  <td>
                    <Link to={`/product/${item.product_id}`} style={{ fontWeight: 600 }}>
                      {item.name}
                    </Link>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                    </div>
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(item.product_id)}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="summary-box">
          <h3>Order Summary</h3>
          {cart.map(item => (
            <div key={item.product_id} className="summary-row">
              <span>{item.name} ×{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
