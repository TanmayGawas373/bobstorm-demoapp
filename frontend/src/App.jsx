import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider }  from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar        from './components/Navbar';
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Orders        from './pages/Orders';
import Wishlist      from './pages/Wishlist';
import Admin         from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ToastProvider>
          <Navbar />
          <main style={{ padding: '1.5rem 0 3rem' }}>
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/products"       element={<Products />} />
              <Route path="/product/:id"    element={<ProductDetail />} />
              <Route path="/cart"           element={<Cart />} />
              <Route path="/checkout"       element={<Checkout />} />
              <Route path="/orders"         element={<Orders />} />
              <Route path="/wishlist"       element={<Wishlist />} />
              <Route path="/admin"          element={<Admin />} />
            </Routes>
          </main>
        </ToastProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
