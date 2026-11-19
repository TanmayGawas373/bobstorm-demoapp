import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const { addToCart }     = useCart();
  const toast             = useToast();

  function load() {
    axios.get('/api/wishlist').then(r => setItems(r.data));
  }

  useEffect(() => { load(); }, []);

  function handleRemove(productId) {
    axios.delete(`/api/wishlist/${productId}`).then(() => {
      setItems(prev => prev.filter(p => p.id !== productId));
      toast('Removed from wishlist');
    });
  }

  function handleAddCart(product) {
    addToCart(product);
    toast(`"${product.name}" added to cart ✓`);
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Wishlist</h1>
        <p>{items.length} saved items</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">♡</div>
          <p>Your wishlist is empty.</p>
          <Link to="/products" className="btn btn-outline" style={{ marginTop: '1rem' }}>Browse Products</Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map(p => (
            <div key={p.id} className="card product-card">
              <Link to={`/product/${p.id}`}>
                <img src={p.image} alt={p.name} loading="lazy" />
              </Link>
              <div className="info">
                <div className="cat">{p.category}</div>
                <div className="name"><Link to={`/product/${p.id}`}>{p.name}</Link></div>
                <div className="price">${p.price.toFixed(2)}</div>
                <div className="actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddCart(p)}>Add to Cart</button>
                  <button className="btn btn-danger btn-sm"  onClick={() => handleRemove(p.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
