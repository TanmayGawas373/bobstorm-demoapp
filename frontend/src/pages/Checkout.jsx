import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate                        = useNavigate();
  const toast                           = useToast();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' });
  const [submitting, setSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="page-header"><h1>Checkout</h1></div>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <p>Your cart is empty. Add some products first.</p>
        </div>
      </div>
    );
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) { toast('Name and email are required', 'error'); return; }
    setSubmitting(true);
    try {
      const payload = {
        customer: form.name,
        email:    form.email,
        items:    cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
      };
      const { data } = await axios.post('/api/orders', payload);
      clearCart();
      toast(`Order #${data.order_id} placed! Total $${data.total.toFixed(2)} ✓`);
      navigate('/orders');
    } catch {
      toast('Failed to place order. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div className="page-header"><h1>Checkout</h1></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem' }}>Shipping Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Alice Johnson" required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="alice@example.com" required />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="New York" />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input name="zip" value={form.zip} onChange={handleChange} placeholder="10001" />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: '.5rem' }}>
              {submitting ? 'Placing order…' : `Place Order · $${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </form>

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
        </div>
      </div>
    </div>
  );
}
