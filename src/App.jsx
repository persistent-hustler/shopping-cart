/* eslint-disable react/prop-types */
// Import necessary libraries
import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Home page component
function Home() {
    return (
        <div>
            <h1>Home Page</h1>
            <p>Welcome to the shopping cart app!</p>
            <img 
                src="https://via.placeholder.com/300" 
                alt="Placeholder graphic" 
                style={{ width: '300px', margin: '20px 0' }} 
            />
            <p>Start shopping by navigating to the shop page using the navigation bar above!</p>
        </div>
    );
}

// Product card component
function ProductCard({ product, onAddToCart }) {
    const [quantity, setQuantity] = useState(0);

    const increment = () => setQuantity(quantity + 1);
    const decrement = () => setQuantity(quantity > 0 ? quantity - 1 : 0);

    return (
        <div style={{ border: '1px solid #ccc', padding: '16px', margin: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{product.title}</h3>
            <img 
                src={product.image} 
                alt={product.title} 
                style={{ width: '100px', height: '100px', objectFit: 'cover', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <button onClick={decrement}>-</button>
                <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))} 
                    style={{ width: '50px', textAlign: 'center', margin: '0 8px' }}
                />
                <button onClick={increment}>+</button>
            </div>
            <button onClick={() => onAddToCart(quantity)}>Add To Cart</button>
        </div>
    );
}

// Shop page component
function Shop({ cartCount, setCartCount }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('https://fakestoreapi.com/products')
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error('Error fetching products:', error));
    }, []);

    const handleAddToCart = (quantity) => {
        if (quantity > 0) {
            setCartCount(cartCount + quantity);
            alert(`${quantity} item(s) added to the cart.`);
        }
    };

    return (
        <div>
            <h1>Shop Page</h1>
            <p>Here you can view and add items to your shopping cart.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {products.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={handleAddToCart} 
                    />
                ))}
            </div>
        </div>
    );
}

// App component with navigation bar
function App() {
    const [cartCount, setCartCount] = useState(0);

    return (
        <Router>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/shop">Shop</Link>
                    </li>
                </ul>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <p>Cart Items: {cartCount}</p>
                    <button style={{ marginLeft: '10px' }}>Go to Cart</button>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop cartCount={cartCount} setCartCount={setCartCount} />} />
            </Routes>
        </Router>
    );
}

export default App;
