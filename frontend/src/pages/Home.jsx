import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const toast = useToast();

  useEffect(() => {
    axios.get('/api/products').then(r => setFeatured(r.data.slice(0, 8)));
  }, []);

  function handleWishlist(product) {
    axios.post('/api/wishlist', { product_id: product.id })
      .then(() => toast(`"${product.name}" added to wishlist ♡`))
      .catch(() => toast('Already in wishlist', 'error'));
  }

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to ShopSmart 🛍️</h1>
        <p>Discover amazing products at unbeatable prices.</p>
        <Link to="/products" className="btn btn-primary">Shop Now</Link>
      </div>

      <div className="page-header">
        <h1>Featured Products</h1>
        <p>Hand-picked just for you</p>
      </div>
      <div className="product-grid">
        {featured.map(p => (
          <ProductCard key={p.id} product={p} onWishlist={handleWishlist} />
        ))}
      </div>
    </div>
  );
}
