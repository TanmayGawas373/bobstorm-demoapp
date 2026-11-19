import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id }  = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty]         = useState(1);
  const { addToCart }         = useCart();
  const toast                 = useToast();

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(r => setProduct(r.data));
  }, [id]);

  if (!product) return <div className="container" style={{ padding: '3rem', color: '#57606a' }}>Loading…</div>;

  function handleAdd() {
    addToCart(product, qty);
    toast(`${qty}× "${product.name}" added to cart ✓`);
  }

  function handleWishlist() {
    axios.post('/api/wishlist', { product_id: product.id })
      .then(() => toast(`"${product.name}" added to wishlist ♡`))
      .catch(() => toast('Already in wishlist', 'error'));
  }

  return (
    <div className="container" style={{ maxWidth: 820, padding: '2rem 1.25rem' }}>
      <Link to="/products" style={{ color: '#57606a', fontSize: '.88rem' }}>← Back to products</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '4/3' }}
          />
        </div>

        <div>
          <span className="badge badge-blue" style={{ marginBottom: '.6rem', display: 'inline-block' }}>
            {product.category}
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '.5rem' }}>{product.name}</h1>
          <p style={{ color: '#e94560', fontSize: '1.6rem', fontWeight: 800, marginBottom: '.8rem' }}>
            ${product.price.toFixed(2)}
          </p>
          <p style={{ color: '#57606a', lineHeight: 1.65, marginBottom: '1.4rem' }}>{product.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '.88rem' }}>Qty:</label>
            <div className="cart-table">
              <div className="qty-ctrl">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleAdd}>Add to Cart</button>
            <button className="btn btn-outline" onClick={handleWishlist}>♡ Wishlist</button>
          </div>
        </div>
      </div>
    </div>
  );
}
