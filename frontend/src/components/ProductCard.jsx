import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product, onWishlist }) {
  const { addToCart } = useCart();
  const toast = useToast();

  function handleAdd() {
    addToCart(product);
    toast(`"${product.name}" added to cart ✓`);
  }

  return (
    <div className="card product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="info">
        <div className="cat">{product.category}</div>
        <div className="name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </div>
        <div className="price">${product.price.toFixed(2)}</div>
        <div className="actions">
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add to Cart</button>
          {onWishlist && (
            <button className="btn btn-outline btn-sm" onClick={() => onWishlist(product)}>♡</button>
          )}
        </div>
      </div>
    </div>
  );
}
