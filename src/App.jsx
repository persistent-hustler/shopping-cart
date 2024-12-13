import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'; // Import your CSS file
import PropTypes from 'prop-types'; // Import PropTypes

const CartContext = createContext();

function Home() {
  return (
    <div className="page-container"> {/* Use CSS classes */}
      <h1>Home Page</h1>
      <p>Welcome to the shopping cart app!</p>
      <img src="https://via.placeholder.com/300" alt="Placeholder graphic" className="placeholder-image" />
      <p>Start shopping by navigating to the shop page!</p>
    </div>
  );
}

function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(0);
  const { addToCart } = useContext(CartContext);

  const updateQuantity = (delta) => {
    setQuantity(Math.max(0, quantity + delta));
  };

  return (
    <div className="product-card">
      <h3>{product.title}</h3>
      <img src={product.image} alt={product.title} className="product-image" />
      <div className="quantity-controls">
        <button onClick={() => updateQuantity(-1)}>-</button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => updateQuantity(parseInt(e.target.value) - quantity || 0)}
          className="quantity-input"
        />
        <button onClick={() => updateQuantity(1)}>+</button>
      </div>
      <button onClick={() => addToCart(product, quantity)} className="add-to-cart-button">Add To Cart</button>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

function Shop() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      });
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1>Shop Page</h1>
      <div className="product-list">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product, quantity) => {
    if (quantity > 0) {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          return [...prevCart, { product, quantity }];
        }
      });
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <nav className="nav-bar">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
          </ul>
          <CartStatus />
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

function CartStatus() {
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  return (
    <div className="cart-status">
      <span>Cart: {cartCount} items</span>
      <button onClick={() => navigate('/cart')} className="cart-button">Go to Cart</button>
    </div>
  );
}

export default App;