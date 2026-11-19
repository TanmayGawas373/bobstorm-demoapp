import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  return (
    <nav className="navbar">
      <div className="inner">
        <NavLink to="/" className="brand">Shop<span>Smart</span></NavLink>
        <nav>
          <NavLink to="/"         end>Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/wishlist">Wishlist</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/cart">
            🛒 Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </div>
    </nav>
  );
}
