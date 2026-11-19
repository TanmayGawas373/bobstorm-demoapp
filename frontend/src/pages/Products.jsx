import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useToast } from '../context/ToastContext';

export default function Products() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const toast = useToast();

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search)   params.search   = search;
    if (category) params.category = category;
    axios.get('/api/products', { params })
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [search, category]);

  function handleWishlist(product) {
    axios.post('/api/wishlist', { product_id: product.id })
      .then(() => toast(`"${product.name}" added to wishlist ♡`))
      .catch(() => toast('Already in wishlist', 'error'));
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>All Products</h1>
        <p>{products.length} products found</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => { setSearch(e.target.value); setCategory(''); }}
        />
        <select value={category} onChange={e => { setCategory(e.target.value); setSearch(''); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || category) && (
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setCategory(''); }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#57606a', textAlign: 'center', padding: '3rem' }}>Loading…</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>No products found.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onWishlist={handleWishlist} />
          ))}
        </div>
      )}
    </div>
  );
}
